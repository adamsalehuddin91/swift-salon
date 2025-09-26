import { NextRequest, NextResponse } from 'next/server'
import { generateBookingQR } from '@/lib/qr-generator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('service')
    const customerId = searchParams.get('customer')

    const qrDataUrl = await generateBookingQR({
      type: 'booking',
      serviceId: serviceId || undefined,
      customerId: customerId || undefined
    })

    return NextResponse.json({
      qrCode: qrDataUrl,
      type: 'booking',
      message: 'QR code generated successfully'
    })

  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { serviceId, customerId } = await request.json()

    const qrDataUrl = await generateBookingQR({
      type: 'booking',
      serviceId,
      customerId
    })

    return NextResponse.json({
      qrCode: qrDataUrl,
      type: 'booking',
      serviceId,
      customerId,
      message: 'Custom booking QR code generated'
    })

  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}