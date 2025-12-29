import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 搜尋庫存（公開，不需要認證）
router.get('/search', async (req, res, next) => {
  try {
    const {
      q, // 搜尋關鍵字
      brand,
      model,
      color,
      capacity,
      grade,
      city,
      district,
      min_price,
      max_price,
      sort = 'distance', // distance, price, created_at
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      is_active: true,
      qty: { gt: 0 }, // 只顯示有庫存的
    };

    if (q) {
      where.OR = [
        { brand: { contains: q as string } },
        { model: { contains: q as string } },
        { spec: { contains: q as string } },
      ];
    }

    if (brand) where.brand = brand;
    if (model) where.model = { contains: model as string };
    if (color) where.color = color;
    if (capacity) where.capacity = capacity;
    if (grade) where.grade = grade;
    if (min_price) where.price = { gte: Number(min_price) };
    if (max_price) {
      where.price = { ...where.price, lte: Number(max_price) };
    }

    // 城市和區域篩選（如果有分店資訊）
    if (city || district) {
      const branchWhere: any = {};
      if (city) branchWhere.city = city;
      if (district) branchWhere.district = district;

      const branches = await prisma.branch.findMany({
        where: branchWhere,
        select: { company_tax_id: true, branch_code: true },
      });

      const branchKeys = branches.map(
        (b) => `${b.company_tax_id}_${b.branch_code}`
      );
      where.OR = [
        ...(where.OR || []),
        ...branchKeys.map((key) => ({
          company_tax_id: key.split('_')[0],
          branch_code: key.split('_')[1],
        })),
      ];
    }

    const orderBy: any = {};
    if (sort === 'price') orderBy.price = 'asc';
    else if (sort === 'created_at') orderBy.created_at = 'desc';
    else orderBy.created_at = 'desc'; // 預設

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          company: {
            select: { name: true, company_tax_id: true },
          },
          branch: {
            select: {
              name: true,
              address: true,
              city: true,
              district: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
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

// 取得單一商品詳情
router.get('/:id', async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
      include: {
        company: {
          select: {
            name: true,
            company_tax_id: true,
            kyc_status: true,
          },
        },
        branch: {
          select: {
            name: true,
            address: true,
            city: true,
            district: true,
            phone: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: '商品不存在',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// 需要認證的路由
router.use(authenticate);

// 取得我的庫存列表
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        company_tax_id: req.user!.company_tax_id,
        branch_code: req.user!.branch_code,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

// 新增庫存
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const {
      brand,
      model,
      spec,
      color,
      capacity,
      grade,
      qty,
      price,
      imei_required,
      description,
      images,
    } = req.body;

    if (!brand || !model || !qty || !price) {
      return res.status(400).json({
        success: false,
        error: '品牌、型號、數量、價格為必填',
      });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        company_tax_id: req.user!.company_tax_id,
        branch_code: req.user!.branch_code,
        brand,
        model,
        spec,
        color,
        capacity,
        grade: grade || 'NEW',
        qty: Number(qty),
        price: Number(price),
        imei_required: imei_required || false,
        description,
        images: images ? JSON.stringify(images) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// 更新庫存
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 檢查是否為自己的庫存
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: '商品不存在',
      });
    }

    if (
      item.company_tax_id !== req.user!.company_tax_id ||
      item.branch_code !== req.user!.branch_code
    ) {
      return res.status(403).json({
        success: false,
        error: '無權限修改此商品',
      });
    }

    // 處理 JSON 欄位
    if (updateData.images) {
      updateData.images = JSON.stringify(updateData.images);
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// 刪除庫存（軟刪除）
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: '商品不存在',
      });
    }

    if (
      item.company_tax_id !== req.user!.company_tax_id ||
      item.branch_code !== req.user!.branch_code
    ) {
      return res.status(403).json({
        success: false,
        error: '無權限刪除此商品',
      });
    }

    await prisma.inventoryItem.update({
      where: { id },
      data: { is_active: false },
    });

    res.json({
      success: true,
      message: '商品已下架',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
