import { compare, hash } from "bcryptjs";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

export class OtpRateLimitError extends Error {}
export class OtpDeliveryConfigurationError extends Error {}

function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

function canUseConsoleDelivery() {
  return process.env.OTP_DELIVERY_MODE === "console" && process.env.NODE_ENV !== "production";
}

export async function requestOtp(phone: string) {
  if (!canUseConsoleDelivery()) {
    throw new OtpDeliveryConfigurationError(
      "OTP delivery is not configured. Set up an SMS provider before using OTP in production."
    );
  }

  const latestChallenge = await prisma.otpChallenge.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" }
  });

  if (
    latestChallenge &&
    latestChallenge.createdAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000 > Date.now()
  ) {
    throw new OtpRateLimitError("Please wait one minute before requesting another OTP.");
  }

  const code = generateOtp();

  await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: await hash(code, 12),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
    }
  });

  console.info(`[DEV OTP] ${phone}: ${code}`);
}

export async function verifyOtp(phone: string, code: string) {
  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      phone,
      consumed: false,
      attempts: { lt: MAX_OTP_ATTEMPTS },
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!challenge) {
    return false;
  }

  const isCorrect = await compare(code, challenge.codeHash);

  if (!isCorrect) {
    const nextAttemptCount = challenge.attempts + 1;

    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts: { increment: 1 },
        consumed: nextAttemptCount >= MAX_OTP_ATTEMPTS
      }
    });

    return false;
  }

  const result = await prisma.otpChallenge.updateMany({
    where: { id: challenge.id, consumed: false },
    data: { consumed: true }
  });

  return result.count === 1;
}
