export interface PointRedemptionRate {
  points: number
  value: number | 'free_service'
  description: string
}

export const DEFAULT_POINT_RATES: PointRedemptionRate[] = [
  {
    points: 50,
    value: 5,
    description: 'RM5 Diskaun'
  },
  {
    points: 100,
    value: 15,
    description: 'RM15 Diskaun'
  },
  {
    points: 200,
    value: 'free_service',
    description: 'Servis Percuma'
  }
]

export function calculatePointsFromAmount(amount: number, pointsPerRinggit: number = 1): number {
  return Math.floor(amount * pointsPerRinggit)
}

export function getAvailableRedemptions(customerPoints: number): PointRedemptionRate[] {
  return DEFAULT_POINT_RATES.filter(rate => customerPoints >= rate.points)
}

export function getPointExpiryDate(): Date {
  const expiryDate = new Date()
  expiryDate.setMonth(expiryDate.getMonth() + 6) // 6 months from now
  return expiryDate
}