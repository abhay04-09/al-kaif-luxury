export interface Env {
  IMAGES: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  /** Set in the Razorpay dashboard when creating the webhook; not the API key. */
  RAZORPAY_WEBHOOK_SECRET: string;
  /** Resend API key. Order emails are simply skipped while this is unset. */
  RESEND_API_KEY: string;
  /** Sender, e.g. 'AL-KAIF <orders@alkaif.in>'. Must be a verified domain. */
  ORDER_FROM_EMAIL: string;
  /** Where the maison's own copy of each order goes. */
  SHOP_EMAIL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}
