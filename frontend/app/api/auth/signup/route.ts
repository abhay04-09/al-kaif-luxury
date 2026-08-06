import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20).optional(),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(128)
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Please correct the highlighted fields.",
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email or phone number already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash

        // Do not add `role` here.
        // Prisma assigns CUSTOMER by default.
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup failed:", error);

    return NextResponse.json(
      { message: "Unable to create your account. Please try again." },
      { status: 500 }
    );
  }
}