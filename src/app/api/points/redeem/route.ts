import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, points, redemptionType, redemptionValue, description } = body

    // Get customer current points
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    if (customer.totalPoints < points) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      )
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct points from customer
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          totalPoints: {
            decrement: points
          }
        }
      })

      // Create point history for redemption
      const pointHistory = await tx.pointHistory.create({
        data: {
          customerId,
          points: -points, // Negative for redemption
          type: 'REDEEMED',
          reason: `Redeemed: ${redemptionValue} - ${description}`
        }
      })

      return {
        customer: updatedCustomer,
        pointHistory
      }
    })

    return NextResponse.json({
      success: true,
      remainingPoints: result.customer.totalPoints,
      redemption: {
        points,
        type: redemptionType,
        value: redemptionValue,
        description
      }
    })
  } catch (error) {
    console.error('Error redeeming points:', error)
    return NextResponse.json(
      { error: 'Failed to redeem points' },
      { status: 500 }
    )
  }
}