import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isMember: true,
        totalPoints: true,
        lastPasswordResetAt: true,
        passwordResetByAdmin: true,
        createdAt: true,
        bookings: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            service: true
          }
        },
        pointHistories: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone } = body

    const customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        pointHistories: {
          orderBy: {
            createdAt: 'desc'
          }
        }
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
    console.error('Error finding customer:', error)
    return NextResponse.json(
      { error: 'Failed to find customer' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { customerId, isMember } = body

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: { isMember },
      include: {
        pointHistories: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // Create membership record if becoming member
    if (isMember) {
      await prisma.membership.create({
        data: {
          customerId,
          type: 'BASIC'
        }
      })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}