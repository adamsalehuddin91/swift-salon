// SwiftSalon Utility Functions
// Aligned with SwiftApps Ecosystem Standard

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind CSS class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities for Malaysian locale
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short') {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('ms-MY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    case 'long':
      return dateObj.toLocaleDateString('ms-MY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    case 'time':
      return dateObj.toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    default:
      return dateObj.toLocaleDateString('ms-MY')
  }
}

// Currency formatting for Malaysian Ringgit
export function formatCurrency(amount: number | string) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2
  }).format(numAmount)
}

// Phone number formatting for Malaysian numbers
export function formatPhoneNumber(phone: string) {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Handle Malaysian phone numbers
  if (cleaned.startsWith('60')) {
    // International format
    return `+${cleaned}`
  } else if (cleaned.startsWith('0')) {
    // Local format
    return `+6${cleaned.substring(1)}`
  } else if (cleaned.length === 9 || cleaned.length === 10) {
    // Mobile without leading 0
    return `+60${cleaned}`
  }

  return phone // Return original if format not recognized
}

// Business hours validation
export function isBusinessOpen(
  currentTime: Date = new Date(),
  businessHours: { open: string; close: string; days: number[] }
) {
  const day = currentTime.getDay() // 0 = Sunday, 1 = Monday, etc.
  const timeString = currentTime.toTimeString().slice(0, 5) // HH:MM format

  if (!businessHours.days.includes(day)) {
    return false
  }

  return timeString >= businessHours.open && timeString <= businessHours.close
}

// Point calculation utilities
export function calculateEarnedPoints(amount: number, pointsPerRinggit: number = 1) {
  return Math.floor(amount * pointsPerRinggit)
}

export function calculateRedemptionValue(points: number, redemptionRates: Record<string, any>) {
  const availableRedemptions = Object.entries(redemptionRates)
    .map(([pointsRequired, value]) => ({
      pointsRequired: parseInt(pointsRequired),
      value
    }))
    .filter(({ pointsRequired }) => points >= pointsRequired)
    .sort((a, b) => b.pointsRequired - a.pointsRequired)

  return availableRedemptions[0] || null
}

// Booking time slot utilities
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
) {
  const slots = []
  const start = new Date(`2024-01-01 ${startTime}`)
  const end = new Date(`2024-01-01 ${endTime}`)

  while (start < end) {
    slots.push(start.toTimeString().slice(0, 5))
    start.setMinutes(start.getMinutes() + intervalMinutes)
  }

  return slots
}

// Validation utilities
export function isValidMalaysianPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '')
  return /^(\+?60|0)[1-9]\d{7,9}$/.test(phone)
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

// Appointment status helpers
export const BOOKING_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800'
} as const

export const PAYMENT_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-orange-100 text-orange-800'
} as const