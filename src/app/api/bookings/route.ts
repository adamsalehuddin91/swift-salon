import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculatePointsFromAmount, getPointExpiryDate } from "@/lib/points"
import { handleAPIError, validateBookingData, NotFoundError, ValidationError, ConflictError } from "@/lib/errors"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    let whereClause = {}
    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      whereClause = {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: true,
        service: true,
        staff: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      serviceId,
      staffId,
      bookingDate,
      startTime,
      notes
    } = body

    // Validate booking data
    validateBookingData(body)

    // Find or create customer
    let customer

    // If customerId is provided (from session), use it directly
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId }
      })

      if (!customer) {
        throw new NotFoundError('Customer not found')
      }
    } else {
      // Find by phone or create new customer
      customer = await prisma.customer.findUnique({
        where: { phone: customerPhone }
      })

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null
          }
        })
      }
    }

    // Get service details for pricing
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      throw new NotFoundError('Servis tidak dijumpai')
    }

    if (!service.isActive) {
      throw new ValidationError('Servis ini tidak tersedia untuk tempahan')
    }

    // Validate staff if specified
    if (staffId) {
      const staff = await prisma.staff.findUnique({
        where: { id: staffId }
      })

      if (!staff || !staff.isActive) {
        throw new ValidationError('Stylist yang dipilih tidak tersedia')
      }
    }

    // Calculate end time
    const start = new Date(`${bookingDate}T${startTime}`)
    const end = new Date(start.getTime() + service.duration * 60000)

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        bookingDate: new Date(bookingDate),
        staffId: staffId || null,
        status: {
          not: 'CANCELLED'
        },
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      throw new ConflictError('Slot masa ini sudah ditempah. Sila pilih masa lain.')
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId,
        staffId: staffId || null,
        bookingDate: new Date(bookingDate),
        startTime: start,
        endTime: end,
        totalAmount: service.price,
        notes: notes || null
      },
      include: {
        customer: true,
        service: true,
        staff: true
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, status, paymentMethod, paymentStatus, staffId } = body

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Validate staff if being assigned/changed
    if (staffId !== undefined && staffId !== null && staffId !== '') {
      const staff = await prisma.staff.findUnique({
        where: { id: staffId }
      })

      if (!staff || !staff.isActive) {
        return NextResponse.json(
          { error: 'Stylist yang dipilih tidak tersedia' },
          { status: 400 }
        )
      }
    }

    // If marking as completed and payment is completed, add points
    if (status === 'COMPLETED' && paymentStatus === 'COMPLETED') {
      const pointsToAdd = calculatePointsFromAmount(Number(booking.totalAmount))

      if (pointsToAdd > 0 && booking.customer.isMember) {
        // Add points to customer
        await prisma.customer.update({
          where: { id: booking.customer.id },
          data: {
            totalPoints: {
              increment: pointsToAdd
            }
          }
        })

        // Create point history
        await prisma.pointHistory.create({
          data: {
            customerId: booking.customer.id,
            points: pointsToAdd,
            type: 'EARNED',
            reason: `Earned from booking - ${booking.service?.name}`,
            bookingId: booking.id,
            expiresAt: getPointExpiryDate()
          }
        })
      }

      // Create payment record
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          paymentMethod: paymentMethod || 'CASH',
          status: 'COMPLETED'
        }
      })
    }

    // Prepare update data
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod
    if (staffId !== undefined) {
      updateData.staffId = staffId === '' ? null : staffId
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        customer: true,
        service: true,
        staff: true
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}