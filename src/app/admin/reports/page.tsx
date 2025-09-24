"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Download,
  Filter,
  Star,
  Clock
} from "lucide-react"

interface ReportData {
  period: string
  revenue: number
  bookings: number
  customers: number
  averageBookingValue: number
  popularServices: Array<{
    serviceName: string
    count: number
    revenue: number
  }>
  customersByMonth: Array<{
    month: string
    newCustomers: number
    returningCustomers: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
  }>
  staffPerformance: Array<{
    staffName: string
    bookings: number
    revenue: number
  }>
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('thisMonth')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadReportData()
  }, [dateRange, startDate, endDate])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      } else {
        params.append('period', dateRange)
      }

      const response = await fetch(`/api/reports?${params.toString()}`)
      const reportData = await response.json()
      setData(reportData)
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!data) return

    const csvContent = generateCSV(data)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `swiftsalon-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const generateCSV = (data: ReportData) => {
    let csv = 'SwiftSalon Muslimah - Laporan Perniagaan\n\n'
    csv += `Tempoh,${data.period}\n`
    csv += `Jumlah Pendapatan,RM${data.revenue.toFixed(2)}\n`
    csv += `Jumlah Tempahan,${data.bookings}\n`
    csv += `Jumlah Pelanggan,${data.customers}\n`
    csv += `Purata Nilai Tempahan,RM${data.averageBookingValue.toFixed(2)}\n\n`

    csv += 'Servis Popular\n'
    csv += 'Nama Servis,Jumlah Tempahan,Pendapatan\n'
    data.popularServices.forEach(service => {
      csv += `${service.serviceName},${service.count},RM${service.revenue.toFixed(2)}\n`
    })

    return csv
  }

  if (loading) {
    return (
      <AdminLayout title="Laporan & Analitik">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout title="Laporan & Analitik">
        <div className="text-center py-12">
          <p className="text-gray-600">Ralat memuatkan data laporan</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Laporan & Analitik">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Penapis Laporan
            </h2>
            <button
              onClick={exportReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempoh Masa
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Hari Ini</option>
                <option value="thisWeek">Minggu Ini</option>
                <option value="thisMonth">Bulan Ini</option>
                <option value="lastMonth">Bulan Lepas</option>
                <option value="thisYear">Tahun Ini</option>
                <option value="custom">Tarikh Khusus</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh Mula
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh Akhir
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah Pendapatan</p>
                <p className="text-2xl font-bold text-green-600 mt-1">RM{data.revenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah Tempahan</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{data.bookings}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah Pelanggan</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{data.customers}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purata Nilai Tempahan</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">RM{data.averageBookingValue.toFixed(2)}</p>
              </div>
              <div className="bg-rose-500 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Services */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Servis Popular
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.popularServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-rose-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{service.serviceName}</p>
                        <p className="text-sm text-gray-600">{service.count} tempahan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">RM{service.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Prestasi Staff
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.staffPerformance.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{staff.staffName}</p>
                        <p className="text-sm text-gray-600">{staff.bookings} tempahan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">RM{staff.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        {data.revenueByMonth && data.revenueByMonth.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Trend Pendapatan Bulanan
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.revenueByMonth.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-800">{month.month}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-4">
                        <div
                          className="bg-rose-600 h-2 rounded-full"
                          style={{
                            width: `${Math.max((month.revenue / Math.max(...data.revenueByMonth.map(m => m.revenue))) * 100, 5)}%`
                          }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-800 w-20 text-right">
                        RM{month.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Business Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Ringkasan Analisis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">Prestasi Perniagaan</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Purata nilai tempahan: RM{data.averageBookingValue.toFixed(2)}</li>
                <li>• Jumlah pendapatan tempoh ini: RM{data.revenue.toFixed(2)}</li>
                <li>• Jumlah tempahan: {data.bookings}</li>
                <li>• Pelanggan unik: {data.customers}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">Servis Terpopular</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {data.popularServices.slice(0, 3).map((service, index) => (
                  <li key={index}>
                    • {service.serviceName}: {service.count} tempahan (RM{service.revenue.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}