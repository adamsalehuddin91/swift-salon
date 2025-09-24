import Link from "next/link";
import { Calendar, Users, Scissors, BarChart3, Star, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            SwiftSalon Muslimah
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistem pengurusan salon kecantikan muslimah yang profesional, teratur dan patuh syariah
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Tempah Sekarang
            </Link>
            <Link
              href="/membership"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Daftar Ahli
            </Link>
            <Link
              href="/admin"
              className="border border-rose-600 text-rose-600 hover:bg-rose-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Calendar className="w-12 h-12 text-rose-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tempahan Mudah</h3>
            <p className="text-gray-600">Booking via WhatsApp, QR code atau link terus. Mudah dan cepat!</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Users className="w-12 h-12 text-rose-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Staff Wanita</h3>
            <p className="text-gray-600">Hanya staff wanita untuk menjaga privasi dan kenyamanan pelanggan muslimah.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Star className="w-12 h-12 text-rose-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Membership & Points</h3>
            <p className="text-gray-600">Kumpul mata ganjaran setiap kali datang. Tebus untuk diskaun atau servis percuma!</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Scissors className="w-12 h-12 text-rose-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Servis Lengkap</h3>
            <p className="text-gray-600">Cuci rambut, blow dry, facial, henna, spa kaki - semua untuk wanita muslimah.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Clock className="w-12 h-12 text-rose-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">WhatsApp Reminder</h3>
            <p className="text-gray-600">Automatic reminder 1 hari sebelum appointment supaya tak terlupa.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <BarChart3 className="w-12 h-12 text-rose-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Dashboard Lengkap</h3>
            <p className="text-gray-600">Track sales, pelanggan aktif, servis popular - semua dalam satu tempat.</p>
          </div>
        </div>

        {/* Points System Info */}
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Sistem Mata Ganjaran</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">50 Points</h3>
              <p className="text-green-600">RM5 Diskaun</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">100 Points</h3>
              <p className="text-blue-600">RM15 Diskaun</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">200 Points</h3>
              <p className="text-purple-600">Servis Percuma</p>
            </div>
          </div>
          <p className="text-gray-600 mb-6">Setiap RM1 = 1 Point • Points tamat dalam 6 bulan</p>
          <Link
            href="/points"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Tebus Points Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
