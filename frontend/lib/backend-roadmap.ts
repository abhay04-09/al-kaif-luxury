export const requiredEnvironmentVariables = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "OTP_PROVIDER_API_KEY"
] as const;

export const backendMilestones = [
  "Create PostgreSQL database and connect Prisma",
  "Add email/password authentication",
  "Add Google OAuth authentication",
  "Add mobile OTP provider integration",
  "Persist carts and orders",
  "Create Razorpay orders and verify payment signatures",
  "Protect admin routes by role"
] as const;
