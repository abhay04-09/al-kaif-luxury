import { NextResponse } from "next/server";
import { z } from "zod";
import {
  OtpDeliveryConfigurationError,
  OtpRateLimitError,
  requestOtp
} from "@/lib/otp";

const requestSchema = z.object({
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Use a number such as +919876543210.")
});

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid phone number." },
        { status: 400 }
      );
    }

    await requestOtp(parsed.data.phone);
    return NextResponse.json({ message: "OTP sent successfully." });
  } catch (error) {
    if (error instanceof OtpRateLimitError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }

    if (error instanceof OtpDeliveryConfigurationError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    console.error("OTP request failed:", error);
    return NextResponse.json({ message: "Unable to send OTP. Please try again." }, { status: 500 });
  }
}
