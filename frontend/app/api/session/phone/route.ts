import { authenticate } from "../_shared";

export async function POST(request: Request) {
  const { accessToken, name } = (await request.json()) as {
    accessToken?: string;
    name?: string;
  };
  return authenticate("/api/auth/phone", { accessToken, name });
}
