import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isMember: true,
        totalPoints: true,
        createdAt: true
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        bookings: true,
        pointHistories: true,
        memberships: true
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Pelanggan tidak dijumpai' },
        { status: 404 }
      )
    }

    // Delete all related records first (cascade delete)
    await prisma.$transaction([
      // Delete point histories
      prisma.pointHistory.deleteMany({
        where: { customerId }
      }),
      // Delete memberships
      prisma.membership.deleteMany({
        where: { customerId }
      }),
      // Delete payments related to bookings
      prisma.payment.deleteMany({
        where: {
          booking: {
            customerId
          }
        }
      }),
      // Delete bookings
      prisma.booking.deleteMany({
        where: { customerId }
      }),
      // Finally delete the customer
      prisma.customer.delete({
        where: { id: customerId }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Pelanggan berjaya dipadam'
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Gagal memadam pelanggan' },
      { status: 500 }
    )
  }
}