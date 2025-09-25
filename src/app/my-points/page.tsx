"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Star,
  Gift,
  TrendingUp,
  Calendar,
  Award,
  Crown,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  Filter,
  Download,
  History,
  Target
} from "lucide-react"

interface PointsData {
  totalPoints: number
  pendingPoints: number
  lifetimePoints: number
  membershipType: string
  pointsHistory: Array<{
    id: string
    points: number
    type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'BONUS'
    description: string
    bookingId?: string
    date: string
    expiryDate?: string
  }>
  availableRewards: Array<{
    id: string
    points: number
    value: string
    description: string
    type: 'discount' | 'service'
    available: boolean
  }>
}

interface PointsStats {
  thisMonth: number
  lastMonth: number
  averagePerBooking: number
  nearExpiry: number
}

export default function MyPointsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [pointsStats, setPointsStats] = useState<PointsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [selectedReward, setSelectedReward] = useState<string | null>(null)
  const [historyFilter, setHistoryFilter] = useState<string>('ALL')
  const [showRedeemConfirm, setShowRedeemConfirm] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role === 'ADMIN') {
      router.push('/admin')
      return
    }

    loadPointsData()
  }, [session, status, router])

  const loadPointsData = async () => {
    try {
      const [pointsRes, statsRes] = await Promise.all([
        fetch('/api/customers/points'),
        fetch('/api/customers/points/stats')
      ])

      if (pointsRes.ok && statsRes.ok) {
        const pointsData = await pointsRes.json()
        const statsData = await statsRes.json()
        setPointsData(pointsData)
        setPointsStats(statsData)
      }
    } catch (error) {
      console.error('Error loading points data:', error)
    } finally {
      setLoading(false)
    }
  }

  const redeemPoints = async (reward: any) => {
    setRedeeming(reward.id)

    try {
      const response = await fetch('/api/customers/points/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rewardId: reward.id,
          points: reward.points
        })
      })

      if (response.ok) {
        setShowRedeemConfirm(null)
        loadPointsData()
        // Show success message
        alert(`Berjaya menebus ${reward.value}! Sila tunjukkan kepada kakitangan semasa lawatan.`)
      } else {
        const error = await response.json()
        alert(`Ralat: ${error.message || 'Gagal menebus points'}`)
      }
    } catch (error) {
      console.error('Error redeeming points:', error)
      alert('Ralat menebus points. Sila cuba lagi.')
    } finally {
      setRedeeming(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EARNED': return <Plus className="w-4 h-4 text-green-600" />
      case 'REDEEMED': return <Minus className="w-4 h-4 text-red-600" />
      case 'EXPIRED': return <Clock className="w-4 h-4 text-gray-600" />
      case 'BONUS': return <Gift className="w-4 h-4 text-purple-600" />
      default: return <Star className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EARNED': return 'text-green-600'
      case 'REDEEMED': return 'text-red-600'
      case 'EXPIRED': return 'text-gray-600'
      case 'BONUS': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getMembershipMultiplier = (type: string) => {
    switch (type) {
      case 'PLATINUM': return 3
      case 'GOLD': return 2
      case 'SILVER': return 1.5
      default: return 1
    }
  }

  const filteredHistory = pointsData?.pointsHistory.filter(item => {
    if (historyFilter === 'ALL') return true
    return item.type === historyFilter
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuatkan data points...</p>
        </div>
      </div>
    )
  }

  if (!pointsData || !pointsStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ralat memuatkan data points</p>
          <Link href="/dashboard" className="text-rose-600 hover:text-rose-700">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="flex items-center text-rose-600 hover:text-rose-700 mr-4">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Mata Ganjaran Saya</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Points Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Points Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Points Tersedia</h3>
                <p className="text-3xl font-bold text-gray-800">{pointsData.totalPoints}</p>
                {pointsData.pendingPoints > 0 && (
                  <p className="text-xs text-gray-500 mt-1">+{pointsData.pendingPoints} menunggu</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Bulan Ini</h3>
                <p className="text-3xl font-bold text-gray-800">+{pointsStats.thisMonth}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {pointsStats.thisMonth > pointsStats.lastMonth ? '+' : ''}
                  {pointsStats.thisMonth - pointsStats.lastMonth} dari bulan lepas
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Jumlah Terkumpul</h3>
                <p className="text-3xl font-bold text-gray-800">{pointsData.lifetimePoints}</p>
                <p className="text-xs text-gray-500 mt-1">Purata {pointsStats.averagePerBooking}/tempahan</p>
              </div>
            </div>

            {/* Near Expiry Warning */}
            {pointsStats.nearExpiry > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-800">Points Hampir Tamat Tempoh</h3>
                </div>
                <p className="text-yellow-700 text-sm">
                  Anda mempunyai {pointsStats.nearExpiry} points yang akan tamat tempoh dalam 30 hari.
                  Tebus sekarang untuk tidak kehilangan points anda!
                </p>
              </div>
            )}

            {/* Points History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Sejarah Points</h2>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                  >
                    <option value="ALL">Semua</option>
                    <option value="EARNED">Diperoleh</option>
                    <option value="REDEEMED">Ditebus</option>
                    <option value="EXPIRED">Tamat Tempoh</option>
                    <option value="BONUS">Bonus</option>
                  </select>
                </div>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getTypeIcon(item.type)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{item.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString('ms-MY')}
                            {item.expiryDate && (
                              <span className="ml-2">• Tamat: {new Date(item.expiryDate).toLocaleDateString('ms-MY')}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${getTypeColor(item.type)}`}>
                        {item.type === 'REDEEMED' || item.type === 'EXPIRED' ? '-' : '+'}
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tiada sejarah points dijumpai</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Rewards & Actions */}
          <div className="space-y-6">
            {/* Membership Multiplier Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                  {pointsData.membershipType === 'PLATINUM' ? (
                    <Crown className="w-5 h-5 text-purple-600" />
                  ) : pointsData.membershipType === 'GOLD' ? (
                    <Award className="w-5 h-5 text-yellow-600" />
                  ) : pointsData.membershipType === 'SILVER' ? (
                    <Gift className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Star className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Ahli {pointsData.membershipType === 'BASIC' ? 'Asas' :
                          pointsData.membershipType === 'SILVER' ? 'Perak' :
                          pointsData.membershipType === 'GOLD' ? 'Emas' : 'Platinum'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getMembershipMultiplier(pointsData.membershipType)}x Points setiap RM1
                  </p>
                </div>
              </div>

              {pointsData.membershipType === 'BASIC' && (
                <div className="border-t pt-4">
                  <Link
                    href="/membership"
                    className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                  >
                    Naik taraf untuk lebih points →
                  </Link>
                </div>
              )}
            </div>

            {/* Available Rewards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tebus Ganjaran</h3>

              <div className="space-y-3">
                {pointsData.availableRewards.map((reward) => {
                  const isAvailable = pointsData.totalPoints >= reward.points
                  const isRedeeming = redeeming === reward.id

                  return (
                    <div
                      key={reward.id}
                      className={`p-4 border rounded-lg transition-all ${
                        isAvailable
                          ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 cursor-pointer'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                      onClick={() => isAvailable && setShowRedeemConfirm(reward)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{reward.value}</h4>
                          <p className="text-xs text-gray-600 mt-1">{reward.description}</p>
                          <p className="text-sm font-medium text-rose-600 mt-2">
                            {reward.points} points
                          </p>
                        </div>

                        <div className="ml-4">
                          {isAvailable ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 text-right">
                              Perlu<br />{reward.points - pointsData.totalPoints}<br />points lagi
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t">
                <Link
                  href="/booking"
                  className="flex items-center justify-center w-full py-2 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Kumpul lebih points
                </Link>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Tips Kumpul Points
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-rose-600 rounded-full mt-2 mr-3"></div>
                  <p className="text-gray-600">Buat tempahan regular untuk kumpul points konsisten</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-rose-600 rounded-full mt-2 mr-3"></div>
                  <p className="text-gray-600">Naik taraf keahlian untuk dapatkan multiplier points</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-rose-600 rounded-full mt-2 mr-3"></div>
                  <p className="text-gray-600">Tebus points sebelum tamat tempoh (6 bulan)</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-rose-600 rounded-full mt-2 mr-3"></div>
                  <p className="text-gray-600">Dapatkan bonus points melalui program khas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem Confirmation Modal */}
        {showRedeemConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-yellow-600" />
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">Tebus Ganjaran</h3>
                <p className="text-gray-600 mb-6">
                  Anda akan menebus <strong>{showRedeemConfirm.points} points</strong> untuk mendapat{' '}
                  <strong>{showRedeemConfirm.value}</strong>
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    Selepas penebusab, sila tunjukkan skrin ini kepada kakitangan semasa lawatan anda.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRedeemConfirm(null)}
                    disabled={redeeming}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => redeemPoints(showRedeemConfirm)}
                    disabled={redeeming}
                    className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    {redeeming ? 'Menebus...' : 'Tebus Sekarang'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}