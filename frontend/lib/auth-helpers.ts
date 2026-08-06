import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check PostgreSQL rather than trusting an old JWT role claim.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true
    }
  });

  if (!user || user.role !== Role.ADMIN) {
    redirect("/");
  }

  return user;
}
export async function requireAdminApi() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authorized: false,
      status: 401
    } as const;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== Role.ADMIN) {
    return {
      authorized: false,
      status: 403
    } as const;
  }

  return {
    authorized: true,
    status: 200
  } as const;
}