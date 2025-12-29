import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    company_tax_id: string;
    branch_code: string;
    roles: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供認證 token',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 驗證使用者是否存在且啟用
    const user = await prisma.user.findUnique({
      where: { uid: decoded.uid },
      include: { company: true },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: '使用者不存在或已被停用',
      });
    }

    req.user = {
      uid: user.uid,
      company_tax_id: user.company_tax_id,
      branch_code: user.branch_code,
      roles: user.roles,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: '無效的 token',
      });
    }
    next(error);
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未認證',
      });
    }

    if (!roles.includes(req.user.roles)) {
      return res.status(403).json({
        success: false,
        error: '權限不足',
      });
    }

    next();
  };
};
