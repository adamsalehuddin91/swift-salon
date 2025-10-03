import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeBookings = searchParams.get('includeBookings') === 'true'
    const date = searchParams.get('date')

    let bookingsWhere = {}
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      bookingsWhere = {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      }
    } else {
      // Default to today's bookings
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endOfToday = new Date()
      endOfToday.setHours(23, 59, 59, 999)

      bookingsWhere = {
        bookingDate: {
          gte: today,
          lte: endOfToday
        },
        status: {
          not: 'CANCELLED'
        }
      }
    }

    const staff = await prisma.staff.findMany({
      where: {
        isActive: true
      },
      include: includeBookings ? {
        bookings: {
          where: bookingsWhere,
          include: {
            customer: true,
            service: true
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      } : undefined,
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