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

    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
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

    // Extract membership info
    const activeMembership = customer.memberships[0] || null
    const membershipType = activeMembership?.type || 'BASIC'
    const membershipExpiry = activeMembership?.endDate || null

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      isMember: customer.isMember,
      membershipType,
      membershipExpiry
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, phone, email } = await request.json()

    const updatedCustomer = await prisma.customer.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        email
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    })

    return NextResponse.json(updatedCustomer)

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}