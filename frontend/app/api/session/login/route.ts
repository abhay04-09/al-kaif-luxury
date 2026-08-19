import { authenticate } from "../_shared";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };
  return authenticate("/api/auth/login", { email, password });
}
