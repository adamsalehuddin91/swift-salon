import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, phone, email, position } = body

    // Check if phone is already used by another staff member
    const existingStaff = await prisma.staff.findFirst({
      where: {
        phone,
        id: { not: params.id },
        isActive: true
      }
    })

    if (existingStaff) {
      return NextResponse.json(
        { error: 'No. telefon ini sudah digunakan oleh staff lain' },
        { status: 400 }
      )
    }

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        email: email || null,
        position
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json(
      { error: 'Failed to update staff' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if staff has any bookings
    const bookingCount = await prisma.booking.count({
      where: {
        staffId: params.id
      }
    })

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'Tidak boleh memadam staff yang mempunyai tempahan' },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.staff.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Staff deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    )
  }
}