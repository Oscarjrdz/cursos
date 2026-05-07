"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/crypto"

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

export async function updateStudent(
  tenantSlug: string,
  userId: string,
  data: { name: string; email: string; status: string; subscriptionExpiresAt?: string }
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      status: data.status as "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED",
      subscriptionExpiresAt: data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null,
    },
  })
  revalidatePath(`/${tenantSlug}/dashboard`)
}

export async function setStudentCredentials(
  tenantSlug: string,
  userId: string,
  data: { phone: string; password: string }
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      phone: data.phone,
      password: hashPassword(data.password),
    },
  })
  revalidatePath(`/${tenantSlug}/dashboard`)
}

export async function deleteStudent(userId: string, tenantSlug: string) {
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath(`/${tenantSlug}/dashboard`)
}
