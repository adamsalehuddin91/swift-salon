import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, position } = body

    // Check if phone is already used
    const existingStaff = await prisma.staff.findFirst({
      where: {
        phone,
        isActive: true
      }
    })

    if (existingStaff) {
      return NextResponse.json(
        { error: 'No. telefon ini sudah digunakan oleh staff lain' },
        { status: 400 }
      )
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        phone,
        email: email || null,
        position
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    )
  }
}