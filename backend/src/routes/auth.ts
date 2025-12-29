import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import * as crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// LINE Login OAuth 配置
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_CALLBACK_URL = process.env.LINE_CALLBACK_URL || 'http://localhost:5173/auth/line/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// LINE Login OAuth - 跳轉到 LINE 授權頁面
router.get('/line/authorize', (req, res) => {
  if (!LINE_CHANNEL_ID) {
    return res.status(500).json({
      success: false,
      error: 'LINE_CHANNEL_ID 未設置，請在 .env 中配置',
    });
  }

  // 生成 state 用於防止 CSRF 攻擊
  const state = crypto.randomBytes(32).toString('hex');
  
  // 儲存 state 到 session 或 cookie（這裡簡化處理，實際應該用 session）
  res.cookie('line_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600000, // 10 分鐘
  });

  // 構建 LINE 授權 URL
  const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', LINE_CHANNEL_ID);
  authUrl.searchParams.append('redirect_uri', LINE_CALLBACK_URL);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', 'profile openid email');
  authUrl.searchParams.append('bot_prompt', 'normal');

  // 跳轉到 LINE 授權頁面
  res.redirect(authUrl.toString());
});

// LINE Login OAuth Callback - 處理 LINE 回調
router.post('/line/callback', async (req, res, next) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: '缺少授權碼',
      });
    }

    if (!LINE_CHANNEL_ID || !LINE_CHANNEL_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'LINE 配置未完成，請檢查環境變數',
      });
    }

    // 用 code 換取 access token
    const tokenResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINE_CALLBACK_URL,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // 驗證並取得用戶資訊
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const lineProfile = profileResponse.data;
    const lineId = lineProfile.userId;
    const name = lineProfile.displayName;
    const picture = lineProfile.pictureUrl;
    const email = lineProfile.email || null;

    // 查找或建立使用者
    let user = await prisma.user.findFirst({
      where: { line_id: lineId, provider: 'line' },
      include: { company: true, branch: true },
    });

    if (!user) {
      // 首次登入，需要綁定統編
      return res.json({
        success: true,
        requiresRegistration: true,
        line_id: lineId,
        name,
        email,
        picture,
      });
    }

    // 更新最後登入時間和頭像
    await prisma.user.update({
      where: { uid: user.uid },
      data: {
        last_login: new Date(),
        name: name || user.name, // 更新名稱
      },
    });

    // 重新查詢以獲取最新資料
    user = await prisma.user.findUnique({
      where: { uid: user.uid },
      include: { company: true, branch: true },
    });

    // 生成 JWT
    const token = jwt.sign(
      {
        uid: user!.uid,
        company_tax_id: user!.company_tax_id,
        branch_code: user!.branch_code,
        roles: user!.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        uid: user!.uid,
        name: user!.name,
        email: user!.email,
        company: user!.company,
        branch: user!.branch,
        roles: user!.roles,
      },
    });
  } catch (error: any) {
    console.error('LINE callback error:', error.response?.data || error.message);
    next(error);
  }
});

// LINE 登入（模擬 - 保留用於測試）
router.post('/line', async (req, res, next) => {
  try {
    const { line_id, name, email } = req.body;

    if (!line_id) {
      return res.status(400).json({ success: false, error: 'LINE ID 為必填' });
    }

    // 查找或建立使用者
    let user = await prisma.user.findFirst({
      where: { line_id, provider: 'line' },
      include: { company: true, branch: true },
    });

    if (!user) {
      // 首次登入，需要綁定統編
      return res.json({
        success: true,
        requiresRegistration: true,
        line_id,
        name,
        email,
      });
    }

    // 更新最後登入時間
    await prisma.user.update({
      where: { uid: user.uid },
      data: { last_login: new Date() },
    });

    // 生成 JWT
    const token = jwt.sign(
      {
        uid: user.uid,
        company_tax_id: user.company_tax_id,
        branch_code: user.branch_code,
        roles: user.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        company: user.company,
        branch: user.branch,
        roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Google 登入（模擬）
router.post('/google', async (req, res, next) => {
  try {
    const { google_id, email, name } = req.body;

    if (!google_id || !email) {
      return res.status(400).json({ success: false, error: 'Google ID 和 Email 為必填' });
    }

    // 查找或建立使用者
    let user = await prisma.user.findFirst({
      where: { email, provider: 'google' },
      include: { company: true, branch: true },
    });

    if (!user) {
      return res.json({
        success: true,
        requiresRegistration: true,
        google_id,
        email,
        name,
      });
    }

    await prisma.user.update({
      where: { uid: user.uid },
      data: { last_login: new Date() },
    });

    const token = jwt.sign(
      {
        uid: user.uid,
        company_tax_id: user.company_tax_id,
        branch_code: user.branch_code,
        roles: user.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        company: user.company,
        branch: user.branch,
        roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 註冊/綁定統編
router.post('/register', async (req, res, next) => {
  try {
    const {
      provider,
      line_id,
      google_id,
      email,
      name,
      company_tax_id,
      company_name,
      branch_code,
      branch_name,
      address,
      city,
      district,
      phone,
    } = req.body;

    // 驗證必填欄位
    if (!company_tax_id || !company_name || !branch_code || !branch_name) {
      return res.status(400).json({
        success: false,
        error: '統編、公司名稱、分店代碼、分店名稱為必填',
      });
    }

    // 檢查公司是否已存在
    let company = await prisma.company.findUnique({
      where: { company_tax_id },
    });

    if (!company) {
      // 建立新公司
      company = await prisma.company.create({
        data: {
          company_tax_id,
          name: company_name,
          kyc_status: 'PENDING', // 待審核
        },
      });
    }

    // 檢查分店是否已存在
    let branch = await prisma.branch.findUnique({
      where: {
        company_tax_id_branch_code: {
          company_tax_id,
          branch_code,
        },
      },
    });

    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          company_tax_id,
          branch_code,
          name: branch_name,
          address,
          city,
          district,
          phone,
          is_main: true, // 第一個分店設為主店
        },
      });
    }

    // 建立使用者
    const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = await prisma.user.create({
      data: {
        uid,
        company_tax_id,
        branch_code,
        provider,
        email: provider === 'google' ? email : null,
        line_id: provider === 'line' ? line_id : null,
        name,
        phone,
        roles: 'BUYER', // 預設為買家
      },
      include: {
        company: true,
        branch: true,
      },
    });

    const token = jwt.sign(
      {
        uid: user.uid,
        company_tax_id: user.company_tax_id,
        branch_code: user.branch_code,
        roles: user.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        company: user.company,
        branch: user.branch,
        roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
