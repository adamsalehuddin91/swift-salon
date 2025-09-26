import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer data with membership info
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        totalPoints: true,
        isMember: true,
        memberships: {
          where: { isActive: true },
          select: {
            type: true,
            endDate: true
          },
          take: 1
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        bookingDate: true, // Fixed: was 'date'
        status: true,
        totalAmount: true, // Fixed: was 'total'
        service: {
          select: {
            name: true
          }
        }
      }
    })

    // Get recent points history
    const pointsHistory = await prisma.pointHistory.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        points: true,
        type: true,
        description: true,
        createdAt: true
      }
    })

    // Extract membership info
    const activeMembership = customer.memberships[0] || null
    const membershipType = activeMembership?.type || 'BASIC'
    const membershipExpiry = activeMembership?.endDate || null

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      totalPoints: customer.totalPoints,
      isMember: customer.isMember,
      membershipType,
      membershipExpiry,
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        serviceName: booking.service.name,
        date: booking.bookingDate, // Fixed field reference
        status: booking.status,
        total: booking.totalAmount // Fixed field reference
      })),
      pointsHistory
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}