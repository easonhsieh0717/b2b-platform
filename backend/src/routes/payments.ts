import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// 準備付款（建立付款單）
router.post('/:orderId/prepare', async (req: AuthRequest, res, next) => {
  try {
    const { orderId } = req.params;
    const { method } = req.body; // virtual_account, atm, card

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '訂單不存在',
      });
    }

    if (order.buyer_company_tax_id !== req.user!.company_tax_id) {
      return res.status(403).json({
        success: false,
        error: '只有買家可以付款',
      });
    }

    if (order.status !== 'CONFIRMED' && order.status !== 'CREATED') {
      return res.status(400).json({
        success: false,
        error: '訂單狀態不正確',
      });
    }

    // 檢查是否已有付款單
    const existingPayment = await prisma.payment.findUnique({
      where: { order_id: orderId },
    });

    if (existingPayment && existingPayment.status === 'PAID') {
      return res.status(400).json({
        success: false,
        error: '訂單已付款',
      });
    }

    // 計算金流手續費（模擬）
    let fee = 0;
    if (method === 'virtual_account' || method === 'atm') {
      fee = 15; // 固定手續費
    } else if (method === 'card') {
      fee = order.total_amount * 0.02; // 2%
    }

    // 建立或更新付款單
    const payment = await prisma.payment.upsert({
      where: { order_id: orderId },
      update: {
        method,
        fee,
        status: 'PENDING',
      },
      create: {
        order_id: orderId,
        method,
        amount: order.total_amount + order.platform_fee + order.shipping_fee,
        fee,
        status: 'PENDING',
        provider_tx_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    });

    // 生成虛擬帳號（模擬）
    let virtualAccount = null;
    if (method === 'virtual_account' || method === 'atm') {
      virtualAccount = `888${orderId.substring(0, 10).padStart(10, '0')}`;
    }

    res.json({
      success: true,
      data: {
        ...payment,
        virtual_account: virtualAccount,
        payment_url: method === 'card' ? `https://payment.example.com/pay/${payment.provider_tx_id}` : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 模擬付款完成（測試用）
router.post('/:orderId/simulate-pay', async (req: AuthRequest, res, next) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { order_id: orderId },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: '付款單不存在',
      });
    }

    if (payment.status === 'PAID') {
      return res.status(400).json({
        success: false,
        error: '已付款',
      });
    }

    // 更新付款狀態
    await prisma.payment.update({
      where: { order_id: orderId },
      data: {
        status: 'PAID',
        paid_at: new Date(),
      },
    });

    // 更新訂單狀態
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paid_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: '付款成功',
    });
  } catch (error) {
    next(error);
  }
});

// Webhook 接收（第三方金流回調）
router.post('/webhook', async (req, res, next) => {
  try {
    // 驗證 webhook 簽名（實際應該驗證）
    const { order_id, status, tx_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        error: '缺少訂單 ID',
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { order_id },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: '付款單不存在',
      });
    }

    if (status === 'PAID' && payment.status !== 'PAID') {
      await prisma.payment.update({
        where: { order_id },
        data: {
          status: 'PAID',
          paid_at: new Date(),
          provider_tx_id: tx_id,
          webhook_payload: JSON.stringify(req.body),
        },
      });

      await prisma.order.update({
        where: { id: order_id },
        data: {
          status: 'PAID',
          paid_at: new Date(),
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
