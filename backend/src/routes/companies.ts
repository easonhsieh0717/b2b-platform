import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// 取得自己的公司資訊
router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { company_tax_id: req.user!.company_tax_id },
      include: {
        branches: true,
        users: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: '公司不存在',
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
});

// 取得公司資訊（公開）
router.get('/:tax_id', async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { company_tax_id: req.params.tax_id },
      include: {
        branches: {
          where: { is_main: true }, // 只顯示主店
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: '公司不存在',
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
