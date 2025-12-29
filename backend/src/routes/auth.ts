import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// LINE 登入（模擬）
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
