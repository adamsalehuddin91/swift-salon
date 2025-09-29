"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Gift, Crown, Award, Check, Phone, User, Mail, Lock } from "lucide-react"

interface MembershipForm {
  name: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  membershipType: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM'
}

export default function MembershipPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info')
  const [loading, setLoading] = useState(false)
  const [customerData, setCustomerData] = useState<any>(null)
  const [isUpgrade, setIsUpgrade] = useState(false)
  const [form, setForm] = useState<MembershipForm>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    membershipType: 'BASIC'
  })

  useEffect(() => {
    if (status === "loading") return

    if (session && session.user?.role === 'CUSTOMER') {
      loadCustomerData()
    }
  }, [session, status])

  const loadCustomerData = async () => {
    try {
      const response = await fetch(`/api/customers/${session?.user?.id}`)
      if (response.ok) {
        const customer = await response.json()
        setCustomerData(customer)
        setIsUpgrade(customer.isMember)

        // Pre-fill form with customer data
        setForm(prev => ({
          ...prev,
          name: customer.name || '',
          phone: customer.phone || '',
          email: customer.email || ''
        }))
      }
    } catch (error) {
      console.error('Error loading customer data:', error)
    }
  }

  const membershipTiers = [
    {
      type: 'BASIC' as const,
      name: 'Ahli Asas',
      price: 'PERCUMA',
      icon: Star,
      color: 'bg-gray-100 border-gray-300',
      iconColor: 'text-gray-600',
      benefits: [
        'Kumpul 1 point untuk setiap RM1',
        'Points tidak akan expired dalam 6 bulan',
        'Tebus points untuk diskaun & free service',
        'WhatsApp reminder untuk appointment',
        'Priority booking untuk slot popular'
      ]
    },
    {
      type: 'SILVER' as const,
      name: 'Ahli Perak',
      price: 'RM50/tahun',
      icon: Award,
      color: 'bg-gray-50 border-gray-400',
      iconColor: 'text-gray-500',
      benefits: [
        'Semua manfaat Ahli Asas',
        'Kumpul 1.5 point untuk setiap RM1',
        'Diskaun 5% untuk semua service',
        'Hadiah birthday special',
        'Priority customer service'
      ]
    },
    {
      type: 'GOLD' as const,
      name: 'Ahli Emas',
      price: 'RM100/tahun',
      icon: Crown,
      color: 'bg-yellow-50 border-yellow-400',
      iconColor: 'text-yellow-600',
      benefits: [
        'Semua manfaat Ahli Perak',
        'Kumpul 2 point untuk setiap RM1',
        'Diskaun 10% untuk semua service',
        'Free service monthly (pilihan tertentu)',
        'Exclusive access untuk pakej istimewa'
      ]
    },
    {
      type: 'PLATINUM' as const,
      name: 'Ahli Platinum',
      price: 'RM200/tahun',
      icon: Gift,
      color: 'bg-purple-50 border-purple-400',
      iconColor: 'text-purple-600',
      benefits: [
        'Semua manfaat Ahli Emas',
        'Kumpul 3 point untuk setiap RM1',
        'Diskaun 15% untuk semua service',
        'Free premium service monthly',
        'Personal stylist consultation',
        'VIP treatment & exclusive events'
      ]
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // For non-logged-in customers, validate password
    if (!customerData) {
      if (form.password !== form.confirmPassword) {
        alert('Kata laluan tidak sepadan. Sila cuba lagi.')
        setLoading(false)
        return
      }

      if (form.password.length < 6) {
        alert('Kata laluan mesti sekurang-kurangnya 6 aksara.')
        setLoading(false)
        return
      }
    }

    try {
      const response = await fetch('/api/membership/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          membershipType: form.membershipType
        })
      })

      if (response.ok) {
        setStep('success')
      } else {
        const error = await response.json()
        alert(`Ralat: ${error.message || 'Gagal mendaftar keahlian'}`)
      }
    } catch (error) {
      console.error('Error registering membership:', error)
      alert('Ralat: Gagal mendaftar keahlian. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tahniah!</h2>
          <p className="text-gray-600 mb-4">
            Anda telah berjaya mendaftar sebagai ahli SwiftSalon Muslimah.
          </p>
          <div className="bg-rose-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-rose-800 font-medium">
              Jenis Keahlian: {membershipTiers.find(t => t.type === form.membershipType)?.name}
            </p>
            <p className="text-xs text-rose-600 mt-1">
              Mula kumpul points dari tempahan seterusnya!
            </p>
          </div>
          <div className="space-y-2">
            <Link
              href="/booking"
              className="block w-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Buat Tempahan Pertama
            </Link>
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

  if (step === 'form') {
    const selectedTier = membershipTiers.find(t => t.type === form.membershipType)!
    const Icon = selectedTier.icon

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setStep('info')}
              className="flex items-center text-rose-600 hover:text-rose-700 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Kembali
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Daftar Keahlian</h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Selected Membership Display */}
            <div className={`p-6 rounded-lg border-2 ${selectedTier.color} mb-8`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Icon className={`w-8 h-8 ${selectedTier.iconColor} mr-3`} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedTier.name}</h3>
                    <p className="text-lg font-semibold text-rose-600">{selectedTier.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('info')}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Tukar
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Maklumat Peribadi
                  {customerData && (
                    <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      ✓ {isUpgrade ? 'Upgrade' : 'Pendaftaran'}
                    </span>
                  )}
                </h2>

                {customerData ? (
                  // Logged-in customer - show read-only info
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Penuh
                        </label>
                        <div className="text-lg font-medium text-gray-900">{customerData.name}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. Telefon
                        </label>
                        <div className="text-lg font-medium text-gray-900">{customerData.phone}</div>
                      </div>
                    </div>
                    {customerData.email && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="text-lg font-medium text-gray-900">{customerData.email}</div>
                      </div>
                    )}
                    {customerData.isMember && (
                      <div className="mt-3">
                        <div className="flex items-center text-sm text-blue-600">
                          <span className="bg-blue-100 px-2 py-1 rounded-full">
                            👑 Ahli Sedia Ada - {customerData.totalPoints} mata
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Non-logged-in customer - show input fields
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Penuh *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telefon *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="01XXXXXXXX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kata Laluan *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="Sekurang-kurangnya 6 aksara"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                          value={form.password}
                          onChange={(e) => setForm({...form, password: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sahkan Kata Laluan *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="Masukkan kata laluan sekali lagi"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                          value={form.confirmPassword}
                          onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {form.membershipType !== 'BASIC' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Yuran keahlian {selectedTier.price} perlu dibayar di kaunter semasa lawatan pertama anda.
                  </p>
                </div>
              )}

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || (!customerData && (!form.name || !form.phone || !form.email))}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Memproses...' : (customerData ? (isUpgrade ? 'Upgrade Keahlian' : 'Daftar Keahlian') : 'Daftar Sekarang')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-rose-600 hover:text-rose-700 mr-4">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Kembali
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Keahlian SwiftSalon</h1>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pilih Pakej Keahlian Yang Sesuai
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Daftar sebagai ahli dan nikmati pelbagai faedah istimewa termasuk kumpul points,
            diskaun eksklusif, dan layanan keutamaan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {membershipTiers.map((tier) => {
            const Icon = tier.icon
            const isSelected = form.membershipType === tier.type

            return (
              <div
                key={tier.type}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50 shadow-lg scale-105'
                    : `${tier.color} hover:shadow-lg hover:scale-102`
                }`}
                onClick={() => setForm({...form, membershipType: tier.type})}
              >
                <div className="text-center">
                  <Icon className={`w-12 h-12 mx-auto mb-4 ${
                    isSelected ? 'text-rose-600' : tier.iconColor
                  }`} />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                  <p className="text-lg font-semibold text-rose-600 mb-4">{tier.price}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    {tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-left">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => setStep('form')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Teruskan dengan {membershipTiers.find(t => t.type === form.membershipType)?.name}
          </button>
        </div>

        {/* Points System Explanation */}
        <div className="bg-white rounded-xl p-8 shadow-lg mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Cara Sistem Points Berfungsi
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">1. Kumpul Points</h3>
              <p className="text-gray-600 text-sm">
                Setiap RM1 yang anda belanjakan = 1-3 points (bergantung jenis keahlian)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">2. Tebus Reward</h3>
              <p className="text-gray-600 text-sm">
                50 points = RM5 diskaun<br/>
                100 points = RM15 diskaun<br/>
                200 points = Free service
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">3. Nikmati Faedah</h3>
              <p className="text-gray-600 text-sm">
                Diskaun automatic, priority booking, dan layanan istimewa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}