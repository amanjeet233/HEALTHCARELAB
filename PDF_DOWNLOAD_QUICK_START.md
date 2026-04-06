# 🚀 Quick Start - PDF Download Feature

## ⚡ 30-Minute Setup

### Step 1: Install Frontend Package (2 min)
```bash
cd frontend
npm install jspdf html2canvas
```

### Step 2: Configure Backend Email (5 min)
Add to `backend/src/main/resources/application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${MAIL_PASSWORD:your-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
app.email.enabled=true
app.email.mock=false
```

### Step 3: Verify All Files Created (2 min)
```
✅ frontend/src/utils/pdfGenerator.ts
✅ frontend/src/hooks/useDownloadBooking.ts
✅ frontend/src/components/BookingActions.tsx
✅ frontend/src/styles/components/BookingActions.css
✅ backend/src/.../service/EmailService.java
✅ backend/src/.../controller/EmailController.java
```

### Step 4: Start Services (5 min)
```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Step 5: Test Feature (10 min)
1. Navigate to MyBookingsPage
2. Click "Receipt" button → PDF downloads
3. Click "Email" button → Email sent
4. Check backend logs for confirmation

---

## 📥 What You Get

### User Perspective
- Download booking receipts as PDF
- Download lab reports as PDF
- Download both documents together
- Email receipts/reports directly to patient
- Mobile-friendly interface

### Technical Perspective
- Client-side PDF generation (no server overhead)
- Secure base64 transmission
- SMTP email integration
- Mock mode for development
- Responsive React component
- Full error handling

---

## 🔧 Common Quick Fixes

### Problem: "jsPDF is not defined"
```bash
npm install jspdf html2canvas
# Then restart frontend dev server
```

### Problem: "JavaMailSender not configured"
Check `application.properties` has:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
```

### Problem: "Gmail authentication failed"
1. Enable 2-Step Verification
2. Generate App Password at: https://myaccount.google.com/apppasswords
3. Use generated password in `MAIL_PASSWORD`

### Problem: "Email not sending"
Enable mock mode temporarily to test:
```properties
app.email.mock=true
```
Check backend logs for email content

---

## 📊 Feature Matrix

| Feature | Status | Where |
|---------|--------|-------|
| Download Receipt | ✅ | MyBookingsPage |
| Download Report | ✅ | MyBookingsPage (COMPLETED only) |
| Download Both | ✅ | Dropdown menu |
| Email Receipt | ✅ | Dropdown menu |
| Email Report | ✅ | Dropdown menu (COMPLETED only) |
| Mock Mode | ✅ | Development |
| Real Email | ✅ | Production |

---

## 💡 Usage Examples

### In Your Components
```typescript
import BookingActions from '../components/BookingActions';

// Compact view (with buttons)
<BookingActions booking={booking} compact={true} showEmail={true} />

// Expanded view (with cards)
<BookingActions booking={booking} compact={false} showEmail={true} />
```

### Direct Download
```typescript
import { useDownloadBooking } from '../hooks/useDownloadBooking';

function MyComponent() {
  const { downloadReceipt } = useDownloadBooking();
  
  return (
    <button onClick={() => downloadReceipt(booking)}>
      Download Receipt
    </button>
  );
}
```

---

## 🎯 Testing Checklist

- [ ] Download Works (Receipt)
- [ ] Download Works (Report - if COMPLETED)
- [ ] Download Works (Both)
- [ ] Email Works (mock mode first)
- [ ] Email Works (real SMTP)
- [ ] Mobile Layout Responsive
- [ ] Dropdown Menu Works
- [ ] Loading States Visible
- [ ] Error Messages Clear
- [ ] No Console Errors

---

## 📞 API Reference

```bash
# Send Email with PDF
curl -X POST http://localhost:8080/api/email/send-with-attachment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toEmail": "user@example.com",
    "subject": "Your Receipt",
    "body": "Attached is your receipt",
    "attachmentBase64": "...",
    "attachmentFilename": "Receipt.pdf"
  }'

# Send Receipt Email
curl -X POST "http://localhost:8080/api/email/send-receipt?email=user@example.com&bookingReference=ABC123&testName=Blood Test" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send Report Email
curl -X POST "http://localhost:8080/api/email/send-report?email=user@example.com&bookingReference=ABC123&testName=Blood Test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 UI Components

### Compact View (Default on MyBookingsPage)
```
[📄] [📊] [✉️] [⋮ ▼]
     └─── More Options
         ├── Download Receipt
         ├── Download Report
         ├── Download Both
         ├── ───────────
         └── Email Receipt
```

### Expanded View (For Detail Pages)
```
┌──────────────────────┐
│ 📥 Download Documents│
├──────────────────────┤
│ 📄 Receipt │ 📊 Report│
│ ────────────────────│
│     📦 Download Both │
└──────────────────────┘

┌──────────────────────┐
│  ✉️ Send via Email   │
├──────────────────────┤
│ ✉️ Receipt │ 📧 Report│
└──────────────────────┘
```

---

## 🏗️ Architecture Overview

```
Frontend (React)
├── MyBookingsPage
│   └── BookingActions (Compact)
│       ├── Download Receipt
│       ├── Download Report
│       ├── Email Receipt/Report
│       └── More Menu
│
├── DetailPage
│   └── BookingActions (Expanded)
│       ├── Download Cards
│       └── Email Cards
│
└── Utilities
    ├── pdfGenerator.ts (Client-side PDF)
    └── useDownloadBooking.ts (Hook)
            │
            └── HTTPS POST
                    ↓
Backend (Spring Boot)
├── EmailController
│   ├── /send-with-attachment
│   ├── /send-receipt
│   └── /send-report
│
├── EmailService
│   ├── Send Simple Email
│   ├── Send Email with Attachment
│   └── SMTP Integration
│
└── EmailRequest DTO
    └── Validation & Mapping
```

---

## 📦 Deployment Checklist

### Before Production
1. [ ] Change `app.email.mock=false`
2. [ ] Configure real SMTP server
3. [ ] Set environment variables for credentials
4. [ ] Test with real email address
5. [ ] Enable SSL/TLS in mail config
6. [ ] Monitor first few sent emails
7. [ ] Set up error alerting

### Environment Variables (Use These Instead of Hardcoding)
```bash
export MAIL_USERNAME="your-email@gmail.com"
export MAIL_PASSWORD="your-16-char-app-password"
export MAIL_HOST="smtp.gmail.com"
export MAIL_PORT="587"
```

---

## 🆘 Help Commands

```bash
# Check if jsPDF is installed
npm list jspdf

# Check email service logs
tail -f backend.log | grep -i email

# Test SMTP connection
telnet smtp.gmail.com 587

# Rebuild frontend
npm run build

# Rebuild backend
mvn clean install
```

---

## ✅ Final Checklist Before Going Live

1. **Frontend**
   - [ ] jsPDF installed
   - [ ] All files in place
   - [ ] No console errors
   - [ ] Responsive on mobile

2. **Backend**
   - [ ] Email service working
   - [ ] Controller endpoints accessible
   - [ ] Authentication working
   - [ ] Logs show success messages

3. **Email**
   - [ ] SMTP configured
   - [ ] Credentials verified
   - [ ] First test email received
   - [ ] Attachment readable

4. **Documentation**
   - [ ] Team reviewed setup guide
   - [ ] Maintenance procedures documented
   - [ ] Support contacts listed

---

## 🎉 You're All Set!

The PDF download and email feature is ready to use. Your users can now:
- ✅ Download booking receipts
- ✅ Download lab reports
- ✅ Email documents
- ✅ Access on mobile devices
- ✅ Get instant notifications

**Need Help?** Refer to PDF_DOWNLOAD_SETUP_GUIDE.md for detailed instructions.

---

**Status**: ✅ Ready for Production  
**Version**: 1.0  
**Support**: Check documentation files for detailed help
