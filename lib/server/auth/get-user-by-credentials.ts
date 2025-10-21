import { PrismaClient } from "@prisma/client";
import { compareSync } from "bcrypt-ts";

const prisma = new PrismaClient();

export async function getUserByCredentials(username: string, password: string) {
  const user = await prisma.adminUser.findFirst({
    where: {
      OR: [
        { username: username },
        { email: username },
      ],
    },
  });

  if (!user) return null;

  const isValid = compareSync(password, user.password_hash);
  if (!isValid) return null;

  return {
    id: user.id,
    name: user.username,
    email: user.email,
    role: user.role,
  };
}
