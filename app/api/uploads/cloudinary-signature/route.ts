import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";

const uploadFolder = "al-kaif/products";

export async function POST() {
  const authorization = await requireAdminApi();

  if (!authorization.authorized) {
    return NextResponse.json(
      {
        message:
          authorization.status === 401
            ? "Authentication is required."
            : "Administrator access is required."
      },
      { status: authorization.status }
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { message: "Cloudinary is not configured for this deployment yet." },
      { status: 503 }
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha1", apiSecret)
    .update(`folder=${uploadFolder}&timestamp=${timestamp}`)
    .digest("hex");

  return NextResponse.json({ apiKey, cloudName, folder: uploadFolder, signature, timestamp });
}
