"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createTenant(data: {
  name: string
  slug: string
  maxStudents: number
  expiresAt?: string
}) {
  const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")

  await prisma.tenant.create({
    data: {
      name: data.name,
      slug,
      maxStudents: data.maxStudents,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  })

  revalidatePath("/admin/dashboard")
}

export async function deleteTenant(id: string) {
  await prisma.tenant.delete({ where: { id } })
  revalidatePath("/admin/dashboard")
}
