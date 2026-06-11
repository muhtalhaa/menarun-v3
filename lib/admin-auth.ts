import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/errors";

export async function requireAdmin(): Promise<
  ActionResult<{ userId: string; email: string; name: string }>
> {
  let session;
  try {
    session = await auth();
  } catch {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Anda harus login sebagai admin.",
      },
    };
  }

  if (!session?.user?.id) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Anda harus login sebagai admin.",
      },
    };
  }

  return {
    success: true,
    data: {
      userId: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? "Admin",
    },
  };
}
