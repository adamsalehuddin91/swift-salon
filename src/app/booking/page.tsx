"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, Scissors } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string
}

interface BookingForm {
  customerName: string
  customerPhone: string
  customerEmail: string
  serviceId: string
  bookingDate: string
  startTime: string
  notes: string
}

interface FormErrors {
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  serviceId?: string
  bookingDate?: string
  startTime?: string
}

export default function BookingPage() {
  const { data: session, status } = useSession()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState<BookingForm>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    bookingDate: '',
    startTime: '',
    notes: ''
  })

  // Load customer data from session when authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      loadCustomerData(session.user.id)
    }
  }, [status, session])

  useEffect(() => {
    loadData()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate customer name
    if (!form.customerName.trim()) {
      newErrors.customerName = 'Nama penuh diperlukan'
    } else if (form.customerName.trim().length < 2) {
      newErrors.customerName = 'Nama mesti sekurang-kurangnya 2 huruf'
    }

    // Validate phone number
    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = 'No. telefon diperlukan'
    } else {
      const phoneRegex = /^(\+?6?01[0-9]|013|014|015|016|017|018|019)\d{7,8}$/
      if (!phoneRegex.test(form.customerPhone.replace(/\s|-/g, ''))) {
        newErrors.customerPhone = 'Format no. telefon tidak sah (contoh: 0123456789)'
      }
    }

    // Validate email (optional but must be valid if provided)
    if (form.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.customerEmail)) {
        newErrors.customerEmail = 'Format email tidak sah'
      }
    }

    // Validate service selection
    if (!form.serviceId) {
      newErrors.serviceId = 'Sila pilih servis'
    }

    // Validate booking date
    if (!form.bookingDate) {
      newErrors.bookingDate = 'Tarikh tempahan diperlukan'
    } else {
      const selectedDate = new Date(form.bookingDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.bookingDate = 'Tarikh tidak boleh pada masa lepas'
      }

      // Check if date is too far in future (e.g., 3 months)
      const maxDate = new Date()
      maxDate.setMonth(maxDate.getMonth() + 3)
      if (selectedDate > maxDate) {
        newErrors.bookingDate = 'Tarikh tidak boleh lebih dari 3 bulan'
      }
    }

    // Validate start time
    if (!form.startTime) {
      newErrors.startTime = 'Masa tempahan diperlukan'
    } else {
      const [hours, minutes] = form.startTime.split(':').map(Number)

      // Business hours validation (9 AM - 9 PM)
      if (hours < 9 || hours >= 21) {
        newErrors.startTime = 'Masa operasi: 9:00 AM - 9:00 PM'
      }

      // If booking is today, check if time is not in the past
      if (form.bookingDate === new Date().toISOString().split('T')[0]) {
        const now = new Date()
        const bookingTime = new Date()
        bookingTime.setHours(hours, minutes, 0, 0)

        if (bookingTime <= now) {
          newErrors.startTime = 'Masa tidak boleh pada masa lepas'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const loadCustomerData = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (response.ok) {
        const customer = await response.json()
        setForm(prev => ({
          ...prev,
          customerName: customer.name || '',
          customerPhone: customer.phone || '',
          customerEmail: customer.email || ''
        }))
      }
    } catch (error) {
      console.error('Error loading customer data:', error)
    }
  }

  const loadData = async () => {
    try {
      const servicesRes = await fetch('/api/services')
      const servicesData = await servicesRes.json()
      setServices(servicesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validate form
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      // Include customer ID from session if available
      const bookingData = {
        ...form,
        customerId: session?.user?.id || undefined
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        setSuccess(true)
        setForm({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          serviceId: '',
          bookingDate: '',
          startTime: '',
          notes: ''
        })
      } else {
        const errorData = await response.json()
        alert(`Ralat: ${errorData.error || 'Gagal membuat tempahan'}`)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Ralat: Gagal membuat tempahan. Sila cuba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setForm({...form, [field]: value})

    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors({...errors, [field]: undefined})
    }
  }

  const selectedService = services.find(s => s.id === form.serviceId)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuatkan...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tempahan Berjaya!</h2>
          <p className="text-gray-600 mb-6">
            Tempahan anda telah berjaya dibuat. Kami akan menghubungi anda untuk pengesahan.
          </p>
          <div className="space-y-2">
            {status === 'authenticated' && session?.user?.role === 'CUSTOMER' ? (
              <>
                <Link
                  href="/dashboard"
                  className="block w-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Pergi ke Dashboard
                </Link>
                <Link
                  href="/booking"
                  className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Buat Tempahan Lain
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/booking"
                  className="block w-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Buat Tempahan Lain
                </Link>
                <Link
                  href="/"
                  className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Kembali ke Laman Utama
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-rose-600 hover:text-rose-700 mr-4">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Kembali
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Buat Tempahan</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Maklumat Pelanggan
                {status === 'authenticated' && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Auto-Populated
                  </span>
                )}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Penuh *
                  </label>
                  <input
                    type="text"
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.customerName
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-rose-500'
                    } ${status === 'authenticated' ? 'bg-green-50' : ''}`}
                    value={form.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                  />
                  {errors.customerName && (
                    <p className="text-red-600 text-sm mt-1">{errors.customerName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXX"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      status === 'authenticated' ? 'bg-green-50' : ''
                    }`}
                    value={form.customerPhone}
                    onChange={(e) => setForm({...form, customerPhone: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Pilihan)
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    status === 'authenticated' ? 'bg-green-50' : ''
                  }`}
                  value={form.customerEmail}
                  onChange={(e) => setForm({...form, customerEmail: e.target.value})}
                />
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Scissors className="w-5 h-5 mr-2" />
                Pilih Servis
              </h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      form.serviceId === service.id
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-300 hover:border-rose-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="serviceId"
                      value={service.id}
                      checked={form.serviceId === service.id}
                      onChange={(e) => setForm({...form, serviceId: e.target.value})}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          Tempoh: {service.duration} minit
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-rose-600">RM{service.price}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Tarikh & Masa
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarikh *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={form.bookingDate}
                    onChange={(e) => setForm({...form, bookingDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Masa *
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={form.startTime}
                    onChange={(e) => setForm({...form, startTime: e.target.value})}
                  />
                </div>
              </div>
              {selectedService && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Anggaran selesai: {form.startTime && (
                      new Date(`2000-01-01T${form.startTime}:00`).getTime() + selectedService.duration * 60000
                    ) ? (
                      new Date(new Date(`2000-01-01T${form.startTime}:00`).getTime() + selectedService.duration * 60000)
                        .toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })
                    ) : '--:--'}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Tambahan (Pilihan)
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Sebarang permintaan khas..."
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting || !form.customerName || !form.customerPhone || !form.serviceId || !form.bookingDate || !form.startTime}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {submitting ? 'Memproses...' : 'Buat Tempahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}