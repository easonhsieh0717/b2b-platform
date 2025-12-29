import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// 取得物流報價
router.post('/:orderId/quote', async (req: AuthRequest, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer_branch: true,
        seller_branch: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '訂單不存在',
      });
    }

    // 檢查權限
    if (
      order.buyer_company_tax_id !== req.user!.company_tax_id &&
      order.seller_company_tax_id !== req.user!.company_tax_id
    ) {
      return res.status(403).json({
        success: false,
        error: '無權限',
      });
    }

    if (order.status !== 'PAID') {
      return res.status(400).json({
        success: false,
        error: '訂單尚未付款',
      });
    }

    // 模擬 Lalamove API 報價
    // 實際應該調用 Lalamove API
    const quoteId = `quote_${Date.now()}`;
    const shippingFee = 150; // 模擬費用
    const etaMin = 60; // 60 分鐘
    const etaMax = 120; // 120 分鐘

    // 建立或更新物流單
    const shipment = await prisma.shipment.upsert({
      where: { order_id: orderId },
      update: {
        quote_id: quoteId,
        status: 'QUOTED',
        eta_min: etaMin,
        eta_max: etaMax,
      },
      create: {
        order_id: orderId,
        provider: 'lalamove',
        quote_id: quoteId,
        status: 'QUOTED',
        eta_min: etaMin,
        eta_max: etaMax,
        pickup_address: `${order.seller_branch.address}, ${order.seller_branch.city} ${order.seller_branch.district}`,
        delivery_address: `${order.buyer_branch.address}, ${order.buyer_branch.city} ${order.buyer_branch.district}`,
      },
    });

    // 更新訂單運費
    await prisma.order.update({
      where: { id: orderId },
      data: { shipping_fee: shippingFee },
    });

    res.json({
      success: true,
      data: {
        ...shipment,
        shipping_fee: shippingFee,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 派車
router.post('/:orderId/dispatch', async (req: AuthRequest, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '訂單不存在',
      });
    }

    if (order.seller_company_tax_id !== req.user!.company_tax_id) {
      return res.status(403).json({
        success: false,
        error: '只有賣家可以派車',
      });
    }

    if (order.status !== 'PAID') {
      return res.status(400).json({
        success: false,
        error: '訂單尚未付款',
      });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { order_id: orderId },
    });

    if (!shipment || shipment.status !== 'QUOTED') {
      return res.status(400).json({
        success: false,
        error: '請先取得物流報價',
      });
    }

    // 模擬 Lalamove 派車
    const driverId = `driver_${Date.now()}`;
    const driverName = '張司機';
    const driverPhone = '0912345678';
    const trackingUrl = `https://lalamove.com/track/${driverId}`;

    await prisma.shipment.update({
      where: { order_id: orderId },
      data: {
        status: 'DRIVER_ASSIGNED',
        driver_id: driverId,
        driver_name: driverName,
        driver_phone: driverPhone,
        tracking_url: trackingUrl,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DISPATCHED',
        dispatched_at: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        driver_id: driverId,
        driver_name: driverName,
        driver_phone: driverPhone,
        tracking_url: trackingUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 更新物流狀態（模擬）
router.post('/:orderId/update-status', async (req: AuthRequest, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // PICKED_UP, DELIVERED

    const shipment = await prisma.shipment.findUnique({
      where: { order_id: orderId },
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: '物流單不存在',
      });
    }

    const updateData: any = { status };

    if (status === 'PICKED_UP') {
      updateData.picked_up_at = new Date();
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'DISPATCHED' },
      });
    } else if (status === 'DELIVERED') {
      updateData.delivered_at = new Date();
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'DELIVERED',
          delivered_at: new Date(),
        },
      });
    }

    await prisma.shipment.update({
      where: { order_id: orderId },
      data: updateData,
    });

    res.json({
      success: true,
      message: '狀態已更新',
    });
  } catch (error) {
    next(error);
  }
});

// Webhook 接收（Lalamove 回調）
router.post('/webhook', async (req, res, next) => {
  try {
    const { order_id, status, driver_info } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        error: '缺少訂單 ID',
      });
    }

    const updateData: any = { status };

    if (driver_info) {
      updateData.driver_id = driver_info.id;
      updateData.driver_name = driver_info.name;
      updateData.driver_phone = driver_info.phone;
    }

    if (status === 'PICKED_UP') {
      updateData.picked_up_at = new Date();
    } else if (status === 'DELIVERED') {
      updateData.delivered_at = new Date();
      await prisma.order.update({
        where: { id: order_id },
        data: {
          status: 'DELIVERED',
          delivered_at: new Date(),
        },
      });
    }

    await prisma.shipment.updateMany({
      where: { order_id },
      data: updateData,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
