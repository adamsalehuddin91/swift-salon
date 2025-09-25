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

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        totalPoints: true,
        membershipType: true,
        membershipExpiry: true
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
        date: true,
        status: true,
        total: true,
        service: {
          select: {
            name: true
          }
        }
      }
    })

    // Get recent points history
    const pointsHistory = await prisma.pointTransaction.findMany({
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

    return NextResponse.json({
      ...customer,
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        serviceName: booking.service.name,
        date: booking.date,
        status: booking.status,
        total: booking.total
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