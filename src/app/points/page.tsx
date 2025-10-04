"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Star, Gift, Search, Phone, CheckCircle, AlertCircle } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  totalPoints: number
  isMember: boolean
}

interface RedemptionOption {
  points: number
  value: string
  description: string
  type: 'discount' | 'service'
}

export default function PointsPage() {
  const [step, setStep] = useState<'search' | 'redeem' | 'success'>('search')
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [selectedRedemption, setSelectedRedemption] = useState<RedemptionOption | null>(null)

  const redemptionOptions: RedemptionOption[] = [
    {
      points: 50,
      value: 'RM5',
      description: 'Diskaun RM5 untuk tempahan seterusnya',
      type: 'discount'
    },
    {
      points: 100,
      value: 'RM15',
      description: 'Diskaun RM15 untuk tempahan seterusnya',
      type: 'discount'
    },
    {
      points: 200,
      value: 'Free Cuci + Blow',
      description: 'Free service Cuci Rambut + Blow Dry',
      type: 'service'
    },
    {
      points: 300,
      value: 'Free Facial',
      description: 'Free Rawatan Wajah (basic)',
      type: 'service'
    },
    {
      points: 500,
      value: 'Free Premium Package',
      description: 'Free service premium pilihan anda',
      type: 'service'
    }
  ]

  const searchCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/customers/search?phone=${encodeURIComponent(phone)}`)

      if (response.ok) {
        const customerData = await response.json()
        if (customerData) {
          setCustomer(customerData)
          setStep('redeem')
        } else {
          alert('Pelanggan tidak dijumpai. Sila daftar sebagai ahli terlebih dahulu.')
        }
      } else {
        alert('Ralat mencari pelanggan. Sila cuba lagi.')
      }
    } catch (error) {
      console.error('Error searching customer:', error)
      alert('Ralat mencari pelanggan. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const redeemPoints = async () => {
    if (!customer || !selectedRedemption) return

    setRedeeming(true)

    try {
      const response = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: customer.id,
          points: selectedRedemption.points,
          redemptionType: selectedRedemption.type,
          redemptionValue: selectedRedemption.value,
          description: selectedRedemption.description
        })
      })

      if (response.ok) {
        setStep('success')
      } else {
        const error = await response.json()
        alert(`Ralat: ${error.message || 'Gagal menebus points'}`)
      }
    } catch (error) {
      console.error('Error redeeming points:', error)
      alert('Ralat menebus points. Sila cuba lagi.')
    } finally {
      setRedeeming(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Points Berjaya Ditebus!</h2>
          <p className="text-gray-600 mb-4">
            {selectedRedemption?.description} telah dikreditkan ke akaun anda.
          </p>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-800 font-medium">
              Points Ditebus: {selectedRedemption?.points}
            </p>
            <p className="text-sm text-green-600">
              Reward: {selectedRedemption?.value}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                setStep('search')
                setCustomer(null)
                setSelectedRedemption(null)
                setPhone('')
              }}
              className="block w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Tebus Points Lagi
            </button>
            <Link
              href="/"
              className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Kembali ke Laman Utama
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'redeem' && customer) {
    const availableOptions = redemptionOptions.filter(option => customer.totalPoints >= option.points)

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('search')}
              className="flex items-center text-amber-600 hover:text-amber-700 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Kembali
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Tebus Points</h1>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>
                <p className="text-gray-600">{customer.phone}</p>
                {customer.email && <p className="text-sm text-gray-500">{customer.email}</p>}
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end mb-2">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-800">{customer.totalPoints}</span>
                </div>
                <p className="text-sm text-gray-600">Points Tersedia</p>
              </div>
            </div>
          </div>

          {/* Redemption Options */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Pilih Reward</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {redemptionOptions.map((option, index) => {
                const isAvailable = customer.totalPoints >= option.points
                const isSelected = selectedRedemption?.points === option.points

                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      !isAvailable
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-300 hover:border-amber-300 hover:bg-amber-25'
                    }`}
                    onClick={() => isAvailable && setSelectedRedemption(option)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          option.type === 'discount' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {option.type === 'discount' ? (
                            <Gift className={`w-4 h-4 ${isAvailable ? 'text-green-600' : 'text-gray-400'}`} />
                          ) : (
                            <Star className={`w-4 h-4 ${isAvailable ? 'text-purple-600' : 'text-gray-400'}`} />
                          )}
                        </div>
                        <div>
                          <h3 className={`font-bold ${isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                            {option.value}
                          </h3>
                          <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isAvailable ? 'text-amber-600' : 'text-gray-400'}`}>
                          {option.points} points
                        </p>
                        {!isAvailable && (
                          <p className="text-xs text-red-500">
                            Perlu {option.points - customer.totalPoints} lagi
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {availableOptions.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Anda belum mempunyai points yang mencukupi untuk menebus reward.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Kumpul lebih banyak points dengan membuat tempahan!
                </p>
              </div>
            )}

            {selectedRedemption && (
              <div className="border-t pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Pengesahan:</strong> Anda akan menebus {selectedRedemption.points} points
                    untuk mendapat {selectedRedemption.value}. Tindakan ini tidak boleh dibatalkan.
                  </p>
                </div>

                <button
                  onClick={redeemPoints}
                  disabled={redeeming}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {redeeming ? 'Memproses...' : `Tebus ${selectedRedemption.points} Points`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-amber-600 hover:text-amber-700 mr-4">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Kembali
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Tebus Points</h1>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Cari Akaun Anda</h2>
          <p className="text-gray-600 text-sm">
            Masukkan no. telefon anda untuk melihat points yang tersedia
          </p>
        </div>

        <form onSubmit={searchCustomer} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. Telefon
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                required
                placeholder="01XXXXXXXX"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Search className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Mencari...' : 'Cari Akaun'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Belum ada akaun ahli?{' '}
            <Link href="/membership" className="text-amber-600 hover:text-amber-700 font-medium">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}