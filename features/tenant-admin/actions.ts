"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createStudent(
  tenantSlug: string,
  data: { name: string; email: string; subscriptionExpiresAt?: string }
) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) throw new Error("Cliente no encontrado")

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error("Ya existe un usuario con ese correo")

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: "STUDENT",
      tenantId: tenant.id,
      status: "ACTIVE",
      subscriptionExpiresAt: data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null,
    },
  })

  revalidatePath(`/${tenantSlug}/dashboard`)
}

export async function deleteStudent(userId: string, tenantSlug: string) {
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath(`/${tenantSlug}/dashboard`)
}
