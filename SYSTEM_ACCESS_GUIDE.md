# SwiftSalon Muslimah - System Access Guide
## Panduan Akses Sistem SwiftSalon Muslimah

**Versi**: 1.0
**Tarikh**: 2 Oktober 2025
**Status**: Production Ready

---

## 🌐 URL Akses / Access URLs

### Production (Live Server)
- **URL Utama**: https://demo.atokcloud.com
- **Admin Panel**: https://demo.atokcloud.com/admin
- **Customer Portal**: https://demo.atokcloud.com/login

### Development (Local Testing)
- **URL Lokal**: http://localhost:3003
- **Admin Panel**: http://localhost:3003/admin
- **Customer Portal**: http://localhost:3003/login

---

## 👨‍💼 ADMIN ACCESS - Akses Pentadbir

### Login Admin
**URL**: https://demo.atokcloud.com/admin/login

**Akaun Admin Default**:
- **Email**: admin@swiftsalon.com
- **Password**: admin123

⚠️ **PENTING**: Tukar password selepas login pertama!

### Admin Dashboard Features
Selepas login, admin boleh akses:

#### 1. **Dashboard Utama** (`/admin`)
- Overview statistik salon
- Booking hari ini
- Pendapatan semasa
- Pelanggan aktif

#### 2. **Pengurusan Pelanggan** (`/admin/customers`)
✨ **NEW FEATURE**: Import CSV/Excel
- Lihat senarai semua pelanggan
- Cari pelanggan (nama, telefon, email)
- Tukar status keahlian
- Reset password pelanggan
- **Import pelanggan secara pukal (CSV/Excel)**
- Download template import

**Cara Import Pelanggan**:
1. Klik butang "Import CSV/Excel"
2. Klik "Muat Turun Template CSV" untuk format yang betul
3. Isi maklumat pelanggan dalam template
4. Upload fail CSV atau Excel
5. System akan validate dan import data

**Format CSV/Excel**:
```csv
name,phone,email,isMember
Siti Aminah,0123456789,siti@example.com,true
Nur Aisyah,0198765432,nur@example.com,false
```

**Catatan**:
- `name` = Nama (wajib)
- `phone` = No telefon (wajib, format: 01xxxxxxxx)
- `email` = Email (optional)
- `isMember` = Status ahli (true/false, default: false)
- Password default = No telefon

#### 3. **Pengurusan Booking** (`/admin/bookings`)
- Lihat semua booking
- Tambah booking manual
- Edit/batalkan booking
- Filter by tarikh/status
- Print booking slip

#### 4. **Pengurusan Perkhidmatan** (`/admin/services`)
- Tambah perkhidmatan baru
- Edit harga dan masa
- Upload gambar servis
- Aktif/nyahaktif servis

#### 5. **Pengurusan Staf** (`/admin/staff`)
- Tambah staf baru
- Edit jadual staf
- Lihat perkhidmatan staf
- Manage availability

#### 6. **Points Management** (`/admin/points`)
- Lihat history points
- Tambah/tolak points manual
- Set reward rules
- Points redemption approval

#### 7. **Laporan** (`/admin/reports`)
- Laporan jualan
- Laporan booking
- Laporan pelanggan
- Export ke PDF/Excel

#### 8. **Tetapan** (`/admin/settings`)
- Maklumat perniagaan
- Waktu operasi
- WhatsApp integration
- Payment gateway setup

---

## 👩‍💼 CUSTOMER ACCESS - Akses Pelanggan

### Halaman Utama (Landing Page)
**URL**: https://demo.atokcloud.com

**Features**:
- Lihat perkhidmatan salon
- Booking via WhatsApp
- Booking via QR code
- Daftar keahlian
- Login pelanggan

### Login Pelanggan
**URL**: https://demo.atokcloud.com/login

**Cara Login**:
- Masukkan nombor telefon (yang didaftarkan)
- Masukkan password (default = nombor telefon)
- Klik "Log Masuk"

### Customer Dashboard Features

#### 1. **Dashboard** (`/dashboard`)
- Overview points
- Booking akan datang
- History perkhidmatan
- Special offers

#### 2. **Buat Booking** (`/booking`)
- Pilih perkhidmatan
- Pilih tarikh dan masa
- Pilih stylist
- Confirm booking
- Bayaran (cash/online)

#### 3. **My Bookings** (`/my-bookings`)
- Lihat booking aktif
- Lihat history booking
- Cancel booking
- Reschedule booking

#### 4. **My Points** (`/my-points`)
- Lihat total points
- Points history
- Redeem points
- Rewards catalog

#### 5. **Profile** (`/profile`)
- Edit profile
- Tukar password
- Upload profile picture
- Notification settings

#### 6. **Membership** (`/membership`)
- Daftar keahlian baru
- Upgrade membership
- Benefits & privileges
- Membership card (digital)

---

## 🔐 USER ROLES & PERMISSIONS

### ADMIN
✅ Full access to all features
✅ Customer management
✅ Booking management
✅ Service management
✅ Staff management
✅ Reports & analytics
✅ System settings

### CUSTOMER (Member)
✅ Book appointments
✅ Earn & redeem points
✅ View booking history
✅ Update profile
✅ Special member pricing
✅ Priority booking

### CUSTOMER (Non-Member)
✅ Book appointments (walk-in pricing)
✅ View booking history
✅ Update profile
❌ No points system
❌ Regular pricing

---

## 📱 SPECIAL FEATURES

### QR Code Booking
**URL**: https://demo.atokcloud.com/qr-booking

- Scan QR code di salon
- Instant booking
- No login required
- Quick registration

### WhatsApp Booking
**Nomor WhatsApp**: +60123456789

**Cara booking via WhatsApp**:
1. Klik butang WhatsApp di landing page
2. Hantar message "Saya nak booking"
3. Follow instruction dari auto-reply
4. Confirm booking

### Points System
**Cara dapat points**:
- 1 point = RM1 perbelanjaan
- Bonus points untuk ahli baru
- Double points untuk member
- Redeem points untuk discount

---

## 🛠️ TROUBLESHOOTING

### Lupa Password (Admin)
1. Contact system administrator
2. Or manual reset via database

### Lupa Password (Customer)
1. Klik "Lupa Password?" di login page
2. Masukkan no telefon
3. Dapatkan reset link via SMS/WhatsApp
4. OR contact admin untuk reset

### Booking Tidak Muncul
1. Refresh page
2. Check internet connection
3. Check booking date/time filter
4. Contact admin if issue persists

### Import CSV Gagal
**Common errors**:
- ❌ No telefon tidak valid (must be 01xxxxxxxx)
- ❌ Email format salah
- ❌ Pelanggan sudah wujud (duplicate phone/email)
- ❌ Format fail salah (use template)

**Solution**:
1. Download template CSV
2. Follow format exactly
3. Check error messages for specific rows
4. Fix data and re-import

---

## 📞 SUPPORT & CONTACT

### Technical Support
- **Email**: support@swiftsalon.com
- **WhatsApp**: +60123456789
- **Hours**: 9am - 6pm (Isnin - Jumaat)

### System Administrator
- **Developer**: Adam (SwiftApps)
- **Contact**: [Your Contact Info]

---

## 🔄 SYSTEM UPDATES

### Latest Update: 2 Oktober 2025
✨ **NEW FEATURES**:
- ✅ CSV/Excel Customer Import
- ✅ Bulk customer upload
- ✅ Import validation & error reporting
- ✅ Download import template
- ✅ Automatic password generation

### Coming Soon
- 🔜 SMS notification integration
- 🔜 Online payment gateway
- 🔜 Mobile app (iOS/Android)
- 🔜 Loyalty program enhancements

---

## 📋 QUICK START CHECKLIST

### For Admin (First Time Setup)
- [ ] Login dengan admin credentials
- [ ] Tukar admin password
- [ ] Tambah perkhidmatan salon
- [ ] Upload gambar perkhidmatan
- [ ] Tambah staf & stylist
- [ ] Set waktu operasi
- [ ] Test booking system
- [ ] Import customer data (if available)
- [ ] Configure WhatsApp (optional)
- [ ] Configure payment gateway (optional)

### For Customer (First Time)
- [ ] Daftar akaun di /membership
- [ ] Login dengan telefon & password
- [ ] Lengkapkan profile
- [ ] Buat booking pertama
- [ ] Nikmati perkhidmatan
- [ ] Kumpul points!

---

**© 2025 SwiftSalon Muslimah - SwiftApps Ecosystem**
**Version**: 1.0 Production
**Last Updated**: 2 Oktober 2025
