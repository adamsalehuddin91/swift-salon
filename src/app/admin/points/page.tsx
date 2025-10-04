"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  Star,
  Gift,
  Users,
  Plus,
  Minus,
  Search,
  Phone,
  Calendar,
  TrendingUp
} from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  totalPoints: number
  pointHistories: PointHistory[]
}

interface PointHistory {
  id: string
  points: number
  type: string
  reason: string
  createdAt: string
  expiresAt: string | null
}

export default function PointsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add')
  const [adjustmentPoints, setAdjustmentPoints] = useState(0)
  const [adjustmentReason, setAdjustmentReason] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data.filter((c: Customer) => c.totalPoints > 0 || c.pointHistories.length > 0))
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const adjustPoints = async () => {
    if (!selectedCustomer || adjustmentPoints <= 0) return

    try {
      const pointsToAdjust = adjustmentType === 'add' ? adjustmentPoints : -adjustmentPoints

      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          points: pointsToAdjust,
          type: 'ADJUSTED',
          reason: adjustmentReason || `Manual ${adjustmentType === 'add' ? 'addition' : 'deduction'} by admin`
        })
      })

      if (response.ok) {
        loadCustomers()
        resetAdjustmentForm()
      } else {
        throw new Error('Failed to adjust points')
      }
    } catch (error) {
      console.error('Error adjusting points:', error)
      alert('Ralat: Gagal melaraskan mata ganjaran')
    }
  }

  const redeemPoints = async (customerId: string, pointsToRedeem: number, value: string) => {
    if (!confirm(`Tebus ${pointsToRedeem} mata ganjaran untuk ${value}?`)) return

    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          points: -pointsToRedeem,
          type: 'REDEEMED',
          reason: `Redeemed for ${value}`
        })
      })

      if (response.ok) {
        loadCustomers()
      } else {
        throw new Error('Failed to redeem points')
      }
    } catch (error) {
      console.error('Error redeeming points:', error)
      alert('Ralat: Gagal menebus mata ganjaran')
    }
  }

  const resetAdjustmentForm = () => {
    setShowAdjustModal(false)
    setSelectedCustomer(null)
    setAdjustmentType('add')
    setAdjustmentPoints(0)
    setAdjustmentReason('')
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)

    return matchesSearch
  })

  const totalPointsInSystem = customers.reduce((sum, customer) => sum + customer.totalPoints, 0)
  const activeMembers = customers.length

  const redemptionRates = [
    { points: 50, value: 'RM5 Diskaun', description: '50 mata ganjaran = RM5 diskaun' },
    { points: 100, value: 'RM15 Diskaun', description: '100 mata ganjaran = RM15 diskaun' },
    { points: 200, value: 'Servis Percuma', description: '200 mata ganjaran = 1 servis percuma' }
  ]

  return (
    <AdminLayout title="Pengurusan Mata Ganjaran">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah Mata Ganjaran</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{totalPointsInSystem.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pelanggan Aktif</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{activeMembers}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purata Mata Ganjaran</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {activeMembers > 0 ? Math.round(totalPointsInSystem / activeMembers) : 0}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Redemption Rates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            Kadar Penebusan Mata Ganjaran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {redemptionRates.map((rate, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{rate.points} Points</p>
                    <p className="text-sm text-gray-600">{rate.description}</p>
                  </div>
                  <div className="text-lg font-bold text-yellow-600">{rate.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Pengurusan Mata Ganjaran Pelanggan</h2>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pelanggan..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Adjustment Modal */}
        {showAdjustModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Laras Mata Ganjaran - {selectedCustomer.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Pelarasan
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="adjustmentType"
                        value="add"
                        checked={adjustmentType === 'add'}
                        onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'subtract')}
                        className="mr-2"
                      />
                      <Plus className="w-4 h-4 mr-1 text-green-600" />
                      Tambah
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="adjustmentType"
                        value="subtract"
                        checked={adjustmentType === 'subtract'}
                        onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'subtract')}
                        className="mr-2"
                      />
                      <Minus className="w-4 h-4 mr-1 text-red-600" />
                      Tolak
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Mata Ganjaran
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={adjustmentPoints}
                    onChange={(e) => setAdjustmentPoints(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sebab Pelarasan
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Nyatakan sebab pelarasan..."
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={adjustPoints}
                    disabled={adjustmentPoints <= 0}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {adjustmentType === 'add' ? 'Tambah' : 'Tolak'} Mata Ganjaran
                  </button>
                  <button
                    onClick={resetAdjustmentForm}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mata Ganjaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Boleh Ditebus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tindakan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="text-lg font-semibold text-yellow-600">
                            {customer.totalPoints}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {redemptionRates
                            .filter(rate => customer.totalPoints >= rate.points)
                            .map((rate, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">{rate.value}</span>
                                <button
                                  onClick={() => redeemPoints(customer.id, rate.points, rate.value)}
                                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                                >
                                  Tebus
                                </button>
                              </div>
                            ))
                          }
                          {redemptionRates.filter(rate => customer.totalPoints >= rate.points).length === 0 && (
                            <span className="text-xs text-gray-400">Mata ganjaran tidak mencukupi</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowAdjustModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
                        >
                          Laras
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tiada data mata ganjaran</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}