import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import routes
import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscriptions';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import userRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import internalRoutes from './routes/internal';

// Import services
import cronService from './services/cronService';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/internal', internalRoutes);

// Health check
app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start cron services (Internal scheduler)
// In production, we prefer external triggers to avoid Render's free tier sleep issues.
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_INTERNAL_CRON === 'true') {
    cronService.startDailyEmailCron();
} else {
    console.log('ℹ️ Internal cron disabled (Production mode). Relying on external triggers.');
}

export default app;