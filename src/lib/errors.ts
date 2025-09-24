import { NextResponse } from 'next/server'

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export function handleAPIError(error: any): NextResponse {
  console.error('API Error:', error)

  // Handle known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        type: error.constructor.name
      },
      { status: error.statusCode }
    )
  }

  // Handle Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'Rekod sudah wujud. Sila gunakan data yang berbeza.' },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          { error: 'Rekod tidak dijumpai.' },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          { error: 'Operasi tidak dibenarkan kerana rekod berkaitan.' },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          { error: 'Ralat pangkalan data. Sila cuba lagi.' },
          { status: 500 }
        )
    }
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  // Handle network/timeout errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return NextResponse.json(
      { error: 'Sambungan terputus. Sila cuba lagi.' },
      { status: 503 }
    )
  }

  // Default server error
  return NextResponse.json(
    { error: 'Ralat server dalaman. Sila cuba lagi.' },
    { status: 500 }
  )
}

export function validateRequired(data: any, fields: string[]): void {
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      throw new ValidationError(`Field '${field}' is required`)
    }
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Malaysian phone number validation
  const phoneRegex = /^(\+?6?01[0-9]|013|014|015|016|017|018|019)\d{7,8}$/
  return phoneRegex.test(phone.replace(/\s|-/g, ''))
}

export function validateBookingData(data: any): void {
  validateRequired(data, ['customerName', 'customerPhone', 'serviceId', 'bookingDate', 'startTime'])

  if (data.customerEmail && !validateEmail(data.customerEmail)) {
    throw new ValidationError('Format email tidak sah')
  }

  if (!validatePhone(data.customerPhone)) {
    throw new ValidationError('Format nombor telefon tidak sah')
  }

  const bookingDate = new Date(data.bookingDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (bookingDate < today) {
    throw new ValidationError('Tarikh tempahan tidak boleh pada masa lepas')
  }
}