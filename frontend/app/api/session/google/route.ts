import { authenticate } from "../_shared";

export async function POST(request: Request) {
  const { accessToken } = (await request.json()) as { accessToken?: string };
  return authenticate("/api/auth/google", { accessToken });
}
