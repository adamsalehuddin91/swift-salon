import QRCode from 'qrcode'

interface BookingQRData {
  type: 'booking'
  salonId?: string
  serviceId?: string
  customerId?: string
}

interface MemberQRData {
  type: 'member'
  customerId: string
  membershipType: string
}

type QRData = BookingQRData | MemberQRData

export class QRCodeGenerator {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  /**
   * Generate booking QR code for customer to scan and book appointment
   */
  static async generateBookingQR(data: BookingQRData): Promise<string> {
    const bookingUrl = new URL('/booking', this.baseUrl)

    if (data.serviceId) {
      bookingUrl.searchParams.set('service', data.serviceId)
    }
    if (data.customerId) {
      bookingUrl.searchParams.set('customer', data.customerId)
    }

    return await QRCode.toDataURL(bookingUrl.toString(), {
      width: 300,
      margin: 2,
      color: {
        dark: '#BE185D', // Rose-600 for salon branding
        light: '#FFFFFF'
      }
    })
  }

  /**
   * Generate member card QR code for customer identification
   */
  static async generateMemberQR(data: MemberQRData): Promise<string> {
    const memberUrl = new URL('/member/verify', this.baseUrl)
    memberUrl.searchParams.set('customer', data.customerId)
    memberUrl.searchParams.set('type', data.membershipType)

    return await QRCode.toDataURL(memberUrl.toString(), {
      width: 200,
      margin: 1,
      color: {
        dark: '#7C3AED', // Purple-600 for membership
        light: '#FFFFFF'
      }
    })
  }

  /**
   * Generate general salon booking QR for marketing materials
   */
  static async generateSalonQR(): Promise<string> {
    const salonUrl = new URL('/booking', this.baseUrl)

    return await QRCode.toDataURL(salonUrl.toString(), {
      width: 400,
      margin: 3,
      color: {
        dark: '#1F2937', // Gray-800 for general use
        light: '#FFFFFF'
      }
    })
  }

  /**
   * Generate QR code for points redemption at salon
   */
  static async generatePointsQR(customerId: string, pointsToRedeem: number): Promise<string> {
    const pointsUrl = new URL('/redeem', this.baseUrl)
    pointsUrl.searchParams.set('customer', customerId)
    pointsUrl.searchParams.set('points', pointsToRedeem.toString())

    return await QRCode.toDataURL(pointsUrl.toString(), {
      width: 250,
      margin: 2,
      color: {
        dark: '#F59E0B', // Yellow-500 for points
        light: '#FFFFFF'
      }
    })
  }
}

// Export utility functions for direct use
export const generateBookingQR = QRCodeGenerator.generateBookingQR
export const generateMemberQR = QRCodeGenerator.generateMemberQR
export const generateSalonQR = QRCodeGenerator.generateSalonQR
export const generatePointsQR = QRCodeGenerator.generatePointsQR