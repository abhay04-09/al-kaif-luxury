import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";

const verifySchema = z.object({
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/),
  code: z.string().regex(/^\d{6}$/, "OTP must contain 6 digits.")
});

export async function POST(request: Request) {
  try {
    const parsed = verifySchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid OTP request." },
        { status: 400 }
      );
    }

    const isValid = await verifyOtp(parsed.data.phone, parsed.data.code);

    if (!isValid) {
      return NextResponse.json(
        { message: "OTP is invalid, expired, or has been used." },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("OTP verification failed:", error);
    return NextResponse.json({ message: "Unable to verify OTP. Please try again." }, { status: 500 });
  }
}
