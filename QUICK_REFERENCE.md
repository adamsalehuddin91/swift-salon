# SwiftSalon - Quick Reference Guide
## Rujukan Pantas SwiftSalon Muslimah

---

## 🚀 QUICK ACCESS

| Tujuan | URL | Credentials |
|--------|-----|-------------|
| **Production Server** | https://demo.atokcloud.com | - |
| **Admin Login** | https://demo.atokcloud.com/admin/login | admin@swiftsalon.com / admin123 |
| **Customer Login** | https://demo.atokcloud.com/login | [Customer Phone] / [Password] |
| **Local Dev** | http://localhost:3003 | Same as above |

---

## 📋 ADMIN MENU

| Feature | URL Path | Description |
|---------|----------|-------------|
| Dashboard | `/admin` | Overview & statistics |
| **Customers** | `/admin/customers` | **✨ NEW: CSV/Excel Import** |
| Bookings | `/admin/bookings` | Manage appointments |
| Services | `/admin/services` | Service management |
| Staff | `/admin/staff` | Staff management |
| Points | `/admin/points` | Points system |
| Reports | `/admin/reports` | Analytics & reports |
| Settings | `/admin/settings` | System configuration |

---

## 👥 CUSTOMER MENU

| Feature | URL Path | Description |
|---------|----------|-------------|
| Dashboard | `/dashboard` | Customer overview |
| Book | `/booking` | Make appointment |
| My Bookings | `/my-bookings` | View bookings |
| My Points | `/my-points` | Points & rewards |
| Profile | `/profile` | Edit profile |
| Membership | `/membership` | Join/upgrade |

---

## ✨ NEW FEATURE: CSV IMPORT

### Location
**Admin → Customers → "Import CSV/Excel" button**

### Template Format
```csv
name,phone,email,isMember
Siti Aminah,0123456789,siti@example.com,true
Nur Aisyah,0198765432,,false
```

### Validation Rules
- ✅ Name: Required
- ✅ Phone: Required, format 01xxxxxxxx
- ✅ Email: Optional, must be valid format
- ✅ isMember: true/false (default: false)
- ✅ Password: Auto-generated (same as phone)

### Steps
1. Click "Import CSV/Excel"
2. Download template
3. Fill customer data
4. Upload file
5. Review results

---

## 🔑 DEFAULT PASSWORDS

### Admin
- Email: `admin@swiftsalon.com`
- Password: `admin123`

### Customers (Imported)
- Password = Phone number
- Example: Phone `0123456789` → Password `0123456789`

---

## 📞 BOOKING METHODS

| Method | URL/Access | Notes |
|--------|------------|-------|
| Web Booking | `/booking` | Login required |
| QR Booking | `/qr-booking` | Scan QR at salon |
| WhatsApp | Click WA button | +60123456789 |
| Walk-in | Admin creates | `/admin/bookings` |

---

## 💰 POINTS SYSTEM

| Action | Points Earned |
|--------|---------------|
| Spend RM1 | 1 point |
| Member signup | Bonus points |
| Birthday month | 2x points |
| Referral | Bonus points |

| Redemption | Points Required |
|------------|-----------------|
| RM10 discount | 100 points |
| Free service | Varies |
| Special offers | Check catalog |

---

## 🛠️ COMMON TASKS

### Add New Customer (Manual)
1. Admin → Customers
2. Click "Add Customer"
3. Fill form
4. Save

### Add New Customer (Bulk)
1. Admin → Customers
2. Click "Import CSV/Excel"
3. Download template
4. Upload filled file

### Create Booking
1. Admin → Bookings
2. Click "New Booking"
3. Select customer
4. Select service & time
5. Confirm

### Reset Customer Password
1. Admin → Customers
2. Find customer
3. Click key icon (🔑)
4. Enter new password
5. Customer notified

---

## ⚡ KEYBOARD SHORTCUTS

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Esc` | Close modal |
| `Ctrl+S` | Save form |

---

## 🐛 TROUBLESHOOTING

### Issue: Cannot login
**Solution**:
- Check username/password
- Check CAPS LOCK
- Try password reset

### Issue: Import failed
**Solution**:
- Use template format
- Check phone format (01xxxxxxxx)
- Check for duplicates
- Review error messages

### Issue: Booking not showing
**Solution**:
- Refresh page
- Check date filter
- Check status filter
- Clear browser cache

---

## 📱 CONTACT SUPPORT

- **Email**: support@swiftsalon.com
- **WhatsApp**: +60123456789
- **Hours**: 9am - 6pm (Mon-Fri)

---

**Last Updated**: 2 Oktober 2025
**Version**: 1.0
