import promClient from 'prom-client';
import { Request, Response } from 'express';
import { logger } from './logger';

/**
 * Prometheus Metrics Configuration
 */

// Create a Registry
export const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
  register,
  prefix: 'pta_',
});

// HTTP Metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'pta_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new promClient.Counter({
  name: 'pta_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Game Metrics
export const battlesTotal = new promClient.Counter({
  name: 'pta_battles_total',
  help: 'Total number of battles',
  labelNames: ['mode', 'result'],
  registers: [register],
});

export const battleDuration = new promClient.Histogram({
  name: 'pta_battle_duration_seconds',
  help: 'Battle duration in seconds',
  labelNames: ['mode'],
  buckets: [30, 60, 120, 300, 600],
  registers: [register],
});

export const activeUsers = new promClient.Gauge({
  name: 'pta_active_users',
  help: 'Number of currently active users',
  registers: [register],
});

export const connectedClients = new promClient.Gauge({
  name: 'pta_connected_clients',
  help: 'Number of connected WebSocket clients',
  registers: [register],
});

// Database Metrics
export const dbQueryDuration = new promClient.Histogram({
  name: 'pta_db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const dbConnectionsActive = new promClient.Gauge({
  name: 'pta_db_connections_active',
  help: 'Number of active database connections',
  registers: [register],
});

// Shop Metrics
export const shopPurchases = new promClient.Counter({
  name: 'pta_shop_purchases_total',
  help: 'Total number of shop purchases',
  labelNames: ['category', 'item_type', 'currency'],
  registers: [register],
});

export const shopRevenue = new promClient.Counter({
  name: 'pta_shop_revenue_total',
  help: 'Total shop revenue by currency',
  labelNames: ['currency'],
  registers: [register],
});

// Authentication Metrics
export const authAttempts = new promClient.Counter({
  name: 'pta_auth_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['type', 'result'], // type: login/register, result: success/failure
  registers: [register],
});

export const activeTokens = new promClient.Gauge({
  name: 'pta_active_tokens',
  help: 'Number of active JWT tokens',
  registers: [register],
});

// Error Metrics
export const errorsTotal = new promClient.Counter({
  name: 'pta_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'component'],
  registers: [register],
});

/**
 * Middleware to collect HTTP metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: Function): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode.toString();
    
    httpRequestDuration
      .labels(method, route, status)
      .observe(duration);
    
    httpRequestTotal
      .labels(method, route, status)
      .inc();
    
    logger.debug('HTTP request metrics recorded', {
      method,
      route,
      status,
      duration,
    });
  });
  
  next();
};

/**
 * Battle metrics helper
 */
export const recordBattle = (mode: string, result: string, duration: number): void => {
  battlesTotal.labels(mode, result).inc();
  battleDuration.labels(mode).observe(duration);
  
  logger.info('Battle metrics recorded', { mode, result, duration });
};

/**
 * Shop purchase metrics helper
 */
export const recordPurchase = (
  category: string,
  itemType: string, 
  currency: string,
  amount: number
): void => {
  shopPurchases.labels(category, itemType, currency).inc();
  shopRevenue.labels(currency).inc(amount);
  
  logger.info('Shop purchase metrics recorded', {
    category,
    itemType,
    currency,
    amount,
  });
};

/**
 * Authentication metrics helper
 */
export const recordAuthAttempt = (type: string, result: string): void => {
  authAttempts.labels(type, result).inc();
  
  logger.info('Auth attempt metrics recorded', { type, result });
};

/**
 * Error metrics helper
 */
export const recordError = (type: string, component: string, error: Error): void => {
  errorsTotal.labels(type, component).inc();
  
  logger.error('Error recorded in metrics', {
    type,
    component,
    error: error.message,
    stack: error.stack,
  });
};

/**
 * Endpoint to expose metrics
 */
export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Failed to get metrics', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
};

export default {
  register,
  metricsMiddleware,
  recordBattle,
  recordPurchase,
  recordAuthAttempt,
  recordError,
  getMetrics,
};