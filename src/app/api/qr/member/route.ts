import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateMemberQR } from '@/lib/qr-generator'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer membership info
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
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

    if (!customer.isMember) {
      return NextResponse.json({ error: 'Customer is not a member' }, { status: 400 })
    }

    const membershipType = customer.memberships[0]?.type || 'BASIC'

    const qrDataUrl = await generateMemberQR({
      type: 'member',
      customerId: customer.id,
      membershipType
    })

    return NextResponse.json({
      qrCode: qrDataUrl,
      type: 'member',
      customerName: customer.name,
      membershipType,
      message: 'Member QR code generated successfully'
    })

  } catch (error) {
    console.error('Member QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate member QR code' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { customerId } = await request.json()

    // Get customer membership info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
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

    const membershipType = customer.memberships[0]?.type || 'BASIC'

    const qrDataUrl = await generateMemberQR({
      type: 'member',
      customerId: customer.id,
      membershipType
    })

    return NextResponse.json({
      qrCode: qrDataUrl,
      type: 'member',
      customerName: customer.name,
      membershipType,
      message: 'Admin generated member QR code'
    })

  } catch (error) {
    console.error('Admin member QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate member QR code' },
      { status: 500 }
    )
  }
}