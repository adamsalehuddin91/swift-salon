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

    const bookings = await prisma.booking.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        total: true,
        notes: true,
        pointsEarned: true,
        createdAt: true,
        customerName: true,
        customerPhone: true,
        service: {
          select: {
            name: true,
            description: true
          }
        },
        staff: {
          select: {
            name: true
          }
        }
      }
    })

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      serviceName: booking.service.name,
      serviceDescription: booking.service.description,
      staffName: booking.staff?.name || null,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      total: booking.total,
      notes: booking.notes,
      pointsEarned: booking.pointsEarned,
      createdAt: booking.createdAt
    }))

    return NextResponse.json(formattedBookings)

  } catch (error) {
    console.error('Customer bookings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}