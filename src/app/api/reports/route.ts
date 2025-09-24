import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'thisMonth'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let dateFilter = {}
    const now = new Date()

    if (period === 'custom' && startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else {
      switch (period) {
        case 'today':
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          dateFilter = {
            gte: startOfDay,
            lt: endOfDay
          }
          break
        case 'thisWeek':
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          dateFilter = {
            gte: startOfWeek
          }
          break
        case 'thisMonth':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          dateFilter = {
            gte: startOfMonth
          }
          break
        case 'lastMonth':
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
          dateFilter = {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
          break
        case 'thisYear':
          const startOfYear = new Date(now.getFullYear(), 0, 1)
          dateFilter = {
            gte: startOfYear
          }
          break
        default:
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
      }
    }

    // Get bookings data
    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: dateFilter,
        status: {
          in: ['COMPLETED', 'CONFIRMED']
        }
      },
      include: {
        customer: true,
        service: true,
        staff: true,
        payments: true
      }
    })

    // Get payments data
    const payments = await prisma.payment.findMany({
      where: {
        paidAt: dateFilter,
        status: 'COMPLETED'
      },
      include: {
        booking: {
          include: {
            service: true,
            staff: true
          }
        }
      }
    })

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
    const totalBookings = bookings.length
    const uniqueCustomers = new Set(bookings.map(b => b.customerId)).size
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Popular services
    const serviceStats = {}
    bookings.forEach(booking => {
      const serviceName = booking.service.name
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = { count: 0, revenue: 0 }
      }
      serviceStats[serviceName].count++
      serviceStats[serviceName].revenue += Number(booking.totalAmount)
    })

    const popularServices = Object.entries(serviceStats)
      .map(([serviceName, stats]: [string, any]) => ({
        serviceName,
        count: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Staff performance
    const staffStats = {}
    bookings.forEach(booking => {
      if (booking.staff) {
        const staffName = booking.staff.name
        if (!staffStats[staffName]) {
          staffStats[staffName] = { bookings: 0, revenue: 0 }
        }
        staffStats[staffName].bookings++
        staffStats[staffName].revenue += Number(booking.totalAmount)
      }
    })

    const staffPerformance = Object.entries(staffStats)
      .map(([staffName, stats]: [string, any]) => ({
        staffName,
        bookings: stats.bookings,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Monthly revenue (last 6 months)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthPayments = await prisma.payment.findMany({
        where: {
          paidAt: {
            gte: monthStart,
            lte: monthEnd
          },
          status: 'COMPLETED'
        }
      })

      const monthRevenue = monthPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)

      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' }),
        revenue: monthRevenue
      })
    }

    // Monthly customers (last 6 months)
    const monthlyCustomers = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const newCustomers = await prisma.customer.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      const returningCustomers = await prisma.booking.findMany({
        where: {
          bookingDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          customerId: true
        },
        distinct: ['customerId']
      })

      monthlyCustomers.push({
        month: monthStart.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' }),
        newCustomers,
        returningCustomers: returningCustomers.length
      })
    }

    const reportData = {
      period: getPeriodLabel(period),
      revenue: totalRevenue,
      bookings: totalBookings,
      customers: uniqueCustomers,
      averageBookingValue,
      popularServices,
      staffPerformance,
      revenueByMonth: monthlyRevenue,
      customersByMonth: monthlyCustomers
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function getPeriodLabel(period: string): string {
  switch (period) {
    case 'today':
      return 'Hari Ini'
    case 'thisWeek':
      return 'Minggu Ini'
    case 'thisMonth':
      return 'Bulan Ini'
    case 'lastMonth':
      return 'Bulan Lepas'
    case 'thisYear':
      return 'Tahun Ini'
    case 'custom':
      return 'Tarikh Khusus'
    default:
      return 'Bulan Ini'
  }
}