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
  revalidatePath("/admin/clientes")
}

export async function updateTenant(
  id: string,
  data: { name: string; slug: string; maxStudents: number; expiresAt?: string; status: string }
) {
  await prisma.tenant.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      maxStudents: data.maxStudents,
      status: data.status as "ACTIVE" | "SUSPENDED" | "EXPIRED",
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  })
  revalidatePath("/admin/clientes")
  revalidatePath(`/admin/clientes/${id}`)
}

export async function assignCourse(tenantId: string, courseId: string) {
  await prisma.tenantCourse.upsert({
    where: { tenantId_courseId: { tenantId, courseId } },
    create: { tenantId, courseId },
    update: {},
  })
  revalidatePath(`/admin/clientes/${tenantId}`)
}

export async function unassignCourse(tenantId: string, courseId: string) {
  await prisma.tenantCourse.delete({
    where: { tenantId_courseId: { tenantId, courseId } },
  })
  revalidatePath(`/admin/clientes/${tenantId}`)
}
