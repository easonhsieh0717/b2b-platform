import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/shipments', require('./routes/shipments'));

// 錯誤處理
app.use(errorHandler);

// 啟動伺服器
app.listen(PORT, () => {
  logger.info(`🚀 伺服器運行在 http://localhost:${PORT}`);
  logger.info(`📝 API 文檔: http://localhost:${PORT}/api`);
});

export default app;
