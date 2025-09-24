import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: {
        phone: phone,
        isMember: true // Only return members
      },
      include: {
        memberships: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!customer) {
      return NextResponse.json(null)
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error searching customer:', error)
    return NextResponse.json(
      { error: 'Failed to search customer' },
      { status: 500 }
    )
  }
}