import * as Joi from 'joi';

/**
 * Environment Configuration Schema
 * Validates all required environment variables at startup
 */
export const configValidationSchema = Joi.object({
  // ============================================
  // Application
  // ============================================
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4000),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  API_PUBLIC_URL: Joi.string().uri().optional(),

  // ============================================
  // Database (PostgreSQL)
  // ============================================
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),
  DATABASE_NAME: Joi.string().default('brandcoach'),
  DATABASE_URL: Joi.string().optional(),
  DATABASE_SYNC: Joi.boolean().default(false),
  DATABASE_LOGGING: Joi.boolean().default(false),

  // ============================================
  // Redis
  // ============================================
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_URL: Joi.string().optional(),

  // ============================================
  // JWT & Authentication
  // ============================================
  JWT_SECRET: Joi.string().required().min(32),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  JWT_ISSUER: Joi.string().default('brandcoachnetwork.com'),

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
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_S3_BUCKET: Joi.string().optional(),
  AWS_S3_ENDPOINT: Joi.string().optional(), // For LocalStack

  // ============================================
  // Email (SMTP)
  // ============================================
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_FROM_EMAIL: Joi.string().email().optional(),
  SMTP_FROM_NAME: Joi.string().default('The Brand Coach Network'),

  // ============================================
  // Email (SendGrid) — legacy, optional
  // ============================================
  SENDGRID_API_KEY: Joi.string().optional(),
  SENDGRID_FROM_EMAIL: Joi.string().email().optional(),
  SENDGRID_FROM_NAME: Joi.string().default('The Brand Coach Network'),

  // ============================================
  // Payments
  // ============================================
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  FLUTTERWAVE_SECRET_KEY: Joi.string().optional(),
  FLUTTERWAVE_WEBHOOK_SECRET: Joi.string().optional(),
  PAYSTACK_SECRET_KEY: Joi.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: Joi.string().optional(),
  PAYSTACK_CURRENCY: Joi.string().length(3).optional(),
  MPESA_ENV: Joi.string().valid('sandbox', 'production').default('sandbox'),
  MPESA_CONSUMER_KEY: Joi.string().optional(),
  MPESA_CONSUMER_SECRET: Joi.string().optional(),
  MPESA_SHORTCODE: Joi.string().optional(),
  MPESA_PASSKEY: Joi.string().optional(),
  MPESA_CALLBACK_URL: Joi.string().uri().optional(),
  MPESA_SANDBOX_CALLBACK_FALLBACK: Joi.string().uri().optional(),
  MPESA_TRANSACTION_TYPE: Joi.string().optional(),

  // ============================================
  // Rate Limiting
  // ============================================
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),
});

/**
 * Configuration interface for type safety
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  aws: AwsConfig;
  email: EmailConfig;
  payments: PaymentsConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  url?: string;
  sync: boolean;
  logging: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  url?: string;
}

export interface JwtConfig {
  secret: string;
  accessExpiration: string;
  refreshExpiration: string;
  issuer: string;
}

export interface AwsConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  s3Bucket?: string;
  s3Endpoint?: string;
}

export interface EmailConfig {
  smtpHost?: string;
  smtpPort: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure: boolean;
  fromEmail?: string;
  fromName: string;
  sendgridApiKey?: string;
}

export interface PaymentsConfig {
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  flutterwaveSecretKey?: string;
  flutterwaveWebhookSecret?: string;
  paystackSecretKey?: string;
  paystackWebhookSecret?: string;
  paystackCurrency?: string;
  mpesaEnv?: 'sandbox' | 'production';
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaShortcode?: string;
  mpesaPasskey?: string;
  mpesaCallbackUrl?: string;
  mpesaSandboxCallbackFallback?: string;
  mpesaTransactionType?: string;
}
