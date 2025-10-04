"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, QrCode, Copy, Share, Download, Check } from "lucide-react"

export default function QRBookingPage() {
  const [bookingUrl, setBookingUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Get the current domain for booking URL
    const baseUrl = window.location.origin
    const fullBookingUrl = `${baseUrl}/booking`
    setBookingUrl(fullBookingUrl)

    // Generate QR code data URL using a simple QR API service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullBookingUrl)}&format=png&margin=10`
    setQrDataUrl(qrUrl)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SwiftSalon Muslimah - Buat Tempahan',
          text: 'Tempah servis kecantikan muslimah anda di SwiftSalon',
          url: bookingUrl
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      copyToClipboard()
    }
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = 'swiftsalon-booking-qr.png'
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center mb-8">
          <Link href="/admin" className="flex items-center text-amber-600 hover:text-amber-700 mr-4">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Kembali
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">QR Code Tempahan</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <QrCode className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              QR Code untuk Tempahan Online
            </h2>
            <p className="text-gray-600">
              Pelanggan boleh scan QR code ini untuk terus ke halaman tempahan
            </p>
          </div>

          {/* QR Code Display */}
          <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
            {qrDataUrl ? (
              <div>
                <img
                  src={qrDataUrl}
                  alt="QR Code untuk Tempahan"
                  className="mx-auto mb-4 border border-gray-200 rounded-lg"
                  width={300}
                  height={300}
                />
                <p className="text-sm text-gray-500">
                  Scan untuk tempahan terus
                </p>
              </div>
            ) : (
              <div className="w-72 h-72 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            )}
          </div>

          {/* URL Display */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Tempahan
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <input
                type="text"
                value={bookingUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-1">Link telah disalin!</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={downloadQR}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Muat Turun QR Code
            </button>
            <button
              onClick={shareUrl}
              className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Share className="w-5 h-5 mr-2" />
              Kongsi Link
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">Cara Menggunakan:</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                Muat turun QR code dan cetak pada kertas atau paparan digital
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                Letakkan QR code di kaunter atau tempat mudah dilihat pelanggan
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                Pelanggan scan menggunakan kamera telefon untuk tempahan terus
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                Atau kongsi link melalui WhatsApp/sosial media
              </li>
            </ul>
          </div>

          {/* Preview */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Lihat bagaimana pelanggan akan melihat halaman tempahan:
            </p>
            <Link
              href="/booking"
              target="_blank"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Lihat Halaman Tempahan
            </Link>
          </div>
        </div>

        {/* Additional QR Options */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">QR Code Tambahan</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Membership QR */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">QR Pendaftaran Ahli</h3>
              <p className="text-sm text-gray-600 mb-4">
                Untuk pelanggan daftar keahlian terus
              </p>
              <button
                onClick={() => {
                  const membershipUrl = `${window.location.origin}/membership`
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(membershipUrl)}&format=png&margin=5`
                  const link = document.createElement('a')
                  link.href = qrUrl
                  link.download = 'swiftsalon-membership-qr.png'
                  link.click()
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Jana QR Keahlian
              </button>
            </div>

            {/* Points QR */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">QR Tebus Points</h3>
              <p className="text-sm text-gray-600 mb-4">
                Untuk pelanggan tebus mata ganjaran
              </p>
              <button
                onClick={() => {
                  const pointsUrl = `${window.location.origin}/points`
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pointsUrl)}&format=png&margin=5`
                  const link = document.createElement('a')
                  link.href = qrUrl
                  link.download = 'swiftsalon-points-qr.png'
                  link.click()
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Jana QR Points
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}