import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminAuth } from "@/lib/auth-middleware"

export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Today's stats
    const [
      todayBookings,
      todayRevenue,
      weeklyBookings,
      monthlyRevenue,
      totalCustomers,
      totalMembers,
      pendingBookings,
      recentBookings
    ] = await Promise.all([
      // Today's bookings count
      prisma.booking.count({
        where: {
          bookingDate: {
            gte: startOfToday,
            lt: endOfToday
          }
        }
      }),

      // Today's revenue
      prisma.payment.aggregate({
        where: {
          paidAt: {
            gte: startOfToday,
            lt: endOfToday
          },
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),

      // Weekly bookings
      prisma.booking.count({
        where: {
          bookingDate: {
            gte: startOfWeek
          }
        }
      }),

      // Monthly revenue
      prisma.payment.aggregate({
        where: {
          paidAt: {
            gte: startOfMonth
          },
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),

      // Total customers
      prisma.customer.count(),

      // Total members
      prisma.customer.count({
        where: {
          isMember: true
        }
      }),

      // Pending bookings
      prisma.booking.count({
        where: {
          status: 'PENDING'
        }
      }),

      // Recent bookings
      prisma.booking.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customer: true,
          service: true,
          staff: true
        }
      })
    ])

    // Popular services this month
    const popularServices = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: {
        bookingDate: {
          gte: startOfMonth
        }
      },
      _count: {
        serviceId: true
      },
      orderBy: {
        _count: {
          serviceId: 'desc'
        }
      },
      take: 5
    })

    // Get service details for popular services
    const serviceDetails = await prisma.service.findMany({
      where: {
        id: {
          in: popularServices.map(s => s.serviceId)
        }
      }
    })

    const popularServicesWithDetails = popularServices.map(ps => ({
      ...ps,
      service: serviceDetails.find(s => s.id === ps.serviceId)
    }))

    return new Response(JSON.stringify({
      todayBookings,
      todayRevenue: todayRevenue._sum.amount || 0,
      weeklyBookings,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      totalCustomers,
      totalMembers,
      pendingBookings,
      recentBookings,
      popularServices: popularServicesWithDetails
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch dashboard data' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})