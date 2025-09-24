import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPointExpiryDate } from "@/lib/points"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, points, type, reason, bookingId } = body

    // Create point history record
    const pointHistory = await prisma.pointHistory.create({
      data: {
        customerId,
        points,
        type,
        reason,
        bookingId: bookingId || null,
        expiresAt: type === 'EARNED' ? getPointExpiryDate() : null
      }
    })

    // Update customer total points
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalPoints: {
          increment: points
        }
      }
    })

    return NextResponse.json(pointHistory)
  } catch (error) {
    console.error('Error managing points:', error)
    return NextResponse.json(
      { error: 'Failed to manage points' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    let whereClause = {}
    if (customerId) {
      whereClause = { customerId }
    }

    const pointHistories = await prisma.pointHistory.findMany({
      where: whereClause,
      include: {
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(pointHistories)
  } catch (error) {
    console.error('Error fetching point histories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch point histories' },
      { status: 500 }
    )
  }
}