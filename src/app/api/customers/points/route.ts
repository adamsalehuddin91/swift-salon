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
        totalPoints: true,
        isMember: true,
        memberships: {
          where: { isActive: true },
          select: {
            type: true
          },
          take: 1
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get points history
    const pointsHistory = await prisma.pointHistory.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        points: true,
        type: true,
        description: true,
        createdAt: true,
        expiryDate: true,
        bookingId: true
      }
    })

    // Calculate additional metrics
    const totalEarned = pointsHistory
      .filter(t => t.type === 'EARNED')
      .reduce((sum, t) => sum + t.points, 0)

    // Define available rewards
    const availableRewards = [
      {
        id: 'discount-5',
        points: 50,
        value: 'RM5 Diskaun',
        description: 'Diskaun RM5 untuk tempahan seterusnya',
        type: 'discount',
        available: customer.totalPoints >= 50
      },
      {
        id: 'discount-15',
        points: 100,
        value: 'RM15 Diskaun',
        description: 'Diskaun RM15 untuk tempahan seterusnya',
        type: 'discount',
        available: customer.totalPoints >= 100
      },
      {
        id: 'free-wash-blow',
        points: 200,
        value: 'Free Cuci + Blow',
        description: 'Free service Cuci Rambut + Blow Dry',
        type: 'service',
        available: customer.totalPoints >= 200
      },
      {
        id: 'free-facial',
        points: 300,
        value: 'Free Facial',
        description: 'Free Rawatan Wajah (basic)',
        type: 'service',
        available: customer.totalPoints >= 300
      },
      {
        id: 'free-premium',
        points: 500,
        value: 'Free Premium Package',
        description: 'Free service premium pilihan anda',
        type: 'service',
        available: customer.totalPoints >= 500
      }
    ]

    // Get membership type from related membership
    const membershipType = customer.memberships[0]?.type || 'BASIC'

    return NextResponse.json({
      totalPoints: customer.totalPoints,
      pendingPoints: 0, // Calculate pending points from recent bookings if needed
      lifetimePoints: totalEarned,
      membershipType,
      pointsHistory: pointsHistory.map(p => ({
        id: p.id,
        points: p.points,
        type: p.type,
        description: p.description,
        date: p.createdAt,
        expiryDate: p.expiryDate,
        bookingId: p.bookingId
      })),
      availableRewards
    })

  } catch (error) {
    console.error('Points API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}