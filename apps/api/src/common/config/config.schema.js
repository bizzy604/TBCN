"use strict";
exports.__esModule = true;
exports.configValidationSchema = void 0;
var Joi = require("joi");
/**
 * Environment Configuration Schema
 * Validates all required environment variables at startup
 */
exports.configValidationSchema = Joi.object({
    // ============================================
    // Application
    // ============================================
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')["default"]('development'),
    PORT: Joi.number()["default"](4000),
    CORS_ORIGIN: Joi.string()["default"]('http://localhost:3000'),
    // ============================================
    // Database (PostgreSQL)
    // ============================================
    DATABASE_HOST: Joi.string()["default"]('localhost'),
    DATABASE_PORT: Joi.number()["default"](5432),
    DATABASE_USERNAME: Joi.string()["default"]('postgres'),
    DATABASE_PASSWORD: Joi.string()["default"]('postgres'),
    DATABASE_NAME: Joi.string()["default"]('brandcoach'),
    DATABASE_URL: Joi.string().optional(),
    DATABASE_SYNC: Joi.boolean()["default"](false),
    DATABASE_LOGGING: Joi.boolean()["default"](false),
    // ============================================
    // Redis
    // ============================================
    REDIS_HOST: Joi.string()["default"]('localhost'),
    REDIS_PORT: Joi.number()["default"](6379),
    REDIS_PASSWORD: Joi.string().optional().allow(''),
    REDIS_URL: Joi.string().optional(),
    // ============================================
    // JWT & Authentication
    // ============================================
    JWT_SECRET: Joi.string().required().min(32),
    JWT_ACCESS_EXPIRATION: Joi.string()["default"]('15m'),
    JWT_REFRESH_EXPIRATION: Joi.string()["default"]('7d'),
    JWT_ISSUER: Joi.string()["default"]('brandcoachnetwork.com'),
    // ============================================
    // OAuth Providers
    // ============================================
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    LINKEDIN_CLIENT_ID: Joi.string().optional(),
    LINKEDIN_CLIENT_SECRET: Joi.string().optional(),
    FACEBOOK_CLIENT_ID: Joi.string().optional(),
    FACEBOOK_CLIENT_SECRET: Joi.string().optional(),
    // ============================================
    // AWS
    // ============================================
    AWS_REGION: Joi.string()["default"]('us-east-1'),
    AWS_ACCESS_KEY_ID: Joi.string().optional(),
    AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
    AWS_S3_BUCKET: Joi.string().optional(),
    AWS_S3_ENDPOINT: Joi.string().optional(),
    // ============================================
    // Email (SendGrid)
    // ============================================
    SENDGRID_API_KEY: Joi.string().optional(),
    SENDGRID_FROM_EMAIL: Joi.string().email().optional(),
    SENDGRID_FROM_NAME: Joi.string()["default"]('The Brand Coach Network'),
    // ============================================
    // Payments
    // ============================================
    STRIPE_SECRET_KEY: Joi.string().optional(),
    STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
    FLUTTERWAVE_SECRET_KEY: Joi.string().optional(),
    FLUTTERWAVE_WEBHOOK_SECRET: Joi.string().optional(),
    // ============================================
    // Rate Limiting
    // ============================================
    THROTTLE_TTL: Joi.number()["default"](60000),
    THROTTLE_LIMIT: Joi.number()["default"](100)
});
