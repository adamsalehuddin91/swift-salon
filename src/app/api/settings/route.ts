import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await prisma.businessSettings.findFirst({
      where: {
        isActive: true
      }
    })

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        id: '',
        name: 'SwiftSalon Muslimah',
        address: '',
        phone: '',
        email: '',
        whatsappNumber: '',
        pointsPerRinggit: 1,
        pointRedemptionRates: {
          "50": 5,
          "100": 15,
          "200": "free_service"
        },
        businessHours: {
          "monday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
          "tuesday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
          "wednesday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
          "thursday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
          "friday": { "isOpen": true, "openTime": "09:00", "closeTime": "18:00" },
          "saturday": { "isOpen": true, "openTime": "09:00", "closeTime": "17:00" },
          "sunday": { "isOpen": false }
        },
        isActive: true
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      address,
      phone,
      email,
      whatsappNumber,
      pointsPerRinggit,
      pointRedemptionRates,
      businessHours
    } = body

    // Find existing settings
    const existingSettings = await prisma.businessSettings.findFirst({
      where: {
        isActive: true
      }
    })

    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.businessSettings.update({
        where: {
          id: existingSettings.id
        },
        data: {
          name,
          address,
          phone,
          email,
          whatsappNumber,
          pointsPerRinggit,
          pointRedemptionRates,
          businessHours
        }
      })
    } else {
      // Create new settings
      settings = await prisma.businessSettings.create({
        data: {
          name,
          address,
          phone,
          email,
          whatsappNumber,
          pointsPerRinggit,
          pointRedemptionRates,
          businessHours
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}