export interface Env {
  IMAGES: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  /** Set in the Razorpay dashboard when creating the webhook; not the API key. */
  RAZORPAY_WEBHOOK_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}
