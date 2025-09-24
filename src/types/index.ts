export interface BookingFormData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  serviceId: string
  staffId?: string
  bookingDate: string
  startTime: string
  notes?: string
}

export interface CustomerData {
  id?: string
  name: string
  phone: string
  email?: string
  isMember: boolean
  totalPoints: number
}

export interface ServiceData {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  category: string
}

export interface StaffData {
  id: string
  name: string
  phone: string
  position: string
  isActive: boolean
}

export interface PointRedemption {
  points: number
  value: number | 'free_service'
  description: string
}

export interface BusinessHours {
  [key: string]: {
    isOpen: boolean
    openTime?: string
    closeTime?: string
  }
}