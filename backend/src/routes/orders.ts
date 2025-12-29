import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// 建立訂單
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const {
      seller_company_tax_id,
      seller_branch_code,
      items, // [{ inventory_id, qty, imei_list? }]
      payment_mode,
      notes,
    } = req.body;

    if (!seller_company_tax_id || !seller_branch_code || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '賣家資訊和商品項目為必填',
      });
    }

    // 計算總金額
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const inventory = await prisma.inventoryItem.findUnique({
        where: { id: item.inventory_id },
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          error: `商品 ${item.inventory_id} 不存在`,
        });
      }

      if (inventory.qty < item.qty) {
        return res.status(400).json({
          success: false,
          error: `商品 ${inventory.brand} ${inventory.model} 庫存不足`,
        });
      }

      if (
        inventory.company_tax_id !== seller_company_tax_id ||
        inventory.branch_code !== seller_branch_code
      ) {
        return res.status(400).json({
          success: false,
          error: '商品與賣家資訊不符',
        });
      }

      const itemTotal = inventory.price * item.qty;
      totalAmount += itemTotal;

      orderItems.push({
        inventory_id: item.inventory_id,
        qty: item.qty,
        unit_price: inventory.price,
        imei_list: item.imei_list ? JSON.stringify(item.imei_list) : null,
      });
    }

    // 計算平台費（假設 2%）
    const platformFee = totalAmount * 0.02;
    const shippingFee = 0; // 將由 Lalamove 報價後更新

    // 建立訂單
    const order = await prisma.order.create({
      data: {
        buyer_company_tax_id: req.user!.company_tax_id,
        buyer_branch_code: req.user!.branch_code,
        seller_company_tax_id,
        seller_branch_code,
        status: 'CREATED',
        payment_mode: payment_mode || 'escrow',
        total_amount: totalAmount,
        platform_fee: platformFee,
        shipping_fee: shippingFee,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            inventory: true,
          },
        },
        buyer_company: {
          select: { name: true, company_tax_id: true },
        },
        seller_company: {
          select: { name: true, company_tax_id: true },
        },
      },
    });

    // 更新庫存
    for (const item of items) {
      await prisma.inventoryItem.update({
        where: { id: item.inventory_id },
        data: {
          qty: {
            decrement: item.qty,
          },
        },
      });
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// 取得我的訂單列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { type = 'all', status, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (type === 'buyer') {
      where.buyer_company_tax_id = req.user!.company_tax_id;
    } else if (type === 'seller') {
      where.seller_company_tax_id = req.user!.company_tax_id;
    } else {
      where.OR = [
        { buyer_company_tax_id: req.user!.company_tax_id },
        { seller_company_tax_id: req.user!.company_tax_id },
      ];
    }

    if (status) {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              inventory: true,
            },
          },
          buyer_company: {
            select: { name: true, company_tax_id: true },
          },
          seller_company: {
            select: { name: true, company_tax_id: true },
          },
          payment: true,
          shipment: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// 取得單一訂單
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            inventory: true,
          },
        },
        buyer_company: true,
        seller_company: true,
        buyer_branch: true,
        seller_branch: true,
        payment: true,
        shipment: true,
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
        error: '無權限查看此訂單',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// 確認訂單（賣家）
router.post('/:id/confirm', async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
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
        error: '只有賣家可以確認訂單',
      });
    }

    if (order.status !== 'CREATED') {
      return res.status(400).json({
        success: false,
        error: '訂單狀態不正確',
      });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'CONFIRMED' },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// 驗收訂單（買家）
router.post('/:id/accept', async (req: AuthRequest, res, next) => {
  try {
    const { imei_list, proof_photos } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
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
        error: '只有買家可以驗收訂單',
      });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        error: '訂單尚未送達',
      });
    }

    // 更新訂單狀態
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: 'ACCEPTED',
        accepted_at: new Date(),
      },
    });

    // 更新物流證明照片
    if (proof_photos) {
      await prisma.shipment.updateMany({
        where: { order_id: req.params.id },
        data: {
          proof_photos: JSON.stringify(proof_photos),
          status: 'PROOF_UPLOADED',
        },
      });
    }

    // 釋放付款（如果是代收代付）
    if (order.payment_mode === 'escrow') {
      await prisma.payment.updateMany({
        where: { order_id: req.params.id },
        data: {
          status: 'RELEASED',
          released_at: new Date(),
        },
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
