import { authenticate } from "../_shared";

export async function POST(request: Request) {
  const { name, email, password, phone } = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  };
  return authenticate("/api/auth/register", { name, email, password, phone });
}
