# 📥 PDF Download Feature - Setup & Installation Guide

## ✅ Overview
This guide covers the complete setup for the booking receipt and lab report PDF download functionality, including email integration.

---

## 🔧 Frontend Setup

### Step 1: Install Required Dependencies

Run the following command in the `frontend` directory:

```bash
npm install jspdf html2canvas
```

Or using yarn:
```bash
yarn add jspdf html2canvas
```

### Step 2: Verify File Structure

Ensure the following files exist:
```
frontend/
├── src/
│   ├── utils/
│   │   └── pdfGenerator.ts          ✅ PDF generation utilities
│   ├── hooks/
│   │   └── useDownloadBooking.ts    ✅ Download hook
│   ├── components/
│   │   └── BookingActions.tsx       ✅ Action buttons component
│   ├── styles/
│   │   └── components/
│   │       └── BookingActions.css   ✅ Component styling
│   ├── pages/
│   │   └── MyBookingsPage.tsx       ✅ Updated with BookingActions
```

### Step 3: Verify Toast Notifications

Ensure notification utility exists at `frontend/src/utils/toast.ts`:
```typescript
export const notify = {
  success: (message: string) => { /* implementation */ },
  error: (message: string) => { /* implementation */ }
};
```

---

## 🔨 Backend Setup

### Step 1: Verify Dependencies

Ensure `pom.xml` contains:
```xml
<!-- Mail dependency (should already exist) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### Step 2: Application Configuration

Add the following to `application.properties` or `application.yml`:

**Option A: Using application.properties**
```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${MAIL_PASSWORD:your-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Email Feature Toggle
app.email.enabled=true
app.email.mock=false
```

**Option B: Using application.yml**
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:your-email@gmail.com}
    password: ${MAIL_PASSWORD:your-app-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true

app:
  email:
    enabled: true
    mock: false
```

### Step 3: For Gmail Users

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
   - Use this as `MAIL_PASSWORD`

### Step 4: For Development/Testing

If you want to use **mock mode** (logs emails instead of sending):
```properties
app.email.enabled=false
app.email.mock=true
```

### Step 5: Verify Backend Files

Ensure these files exist:
```
backend/src/main/java/com/healthcare/labtestbooking/
├── controller/
│   └── EmailController.java         ✅ Email API endpoints
├── service/
│   ├── EmailService.java            ✅ Email sending service
│   └── NotificationService.java     ✅ Existing notifications
├── dto/
│   └── EmailRequest.java            ✅ Email request DTO
```

---

## 🔌 API Endpoints

### 1. Send Email with PDF Attachment
```
POST /api/email/send-with-attachment
Authorization: Bearer {token}

Body:
{
  "toEmail": "patient@example.com",
  "subject": "Your Booking Receipt",
  "body": "Please find your receipt attached...",
  "attachmentBase64": "data:application/pdf;base64,...",
  "attachmentFilename": "Receipt-ABC123.pdf",
  "bookingReference": "ABC123"
}

Response:
{
  "success": true,
  "message": "Email sent successfully"
}
```

### 2. Send Booking Receipt
```
POST /api/email/send-receipt
Authorization: Bearer {token}

Parameters:
- email: patient@example.com
- bookingReference: ABC123
- testName: Full Blood Count

Response:
{
  "success": true,
  "message": "Receipt sent successfully"
}
```

### 3. Send Lab Report
```
POST /api/email/send-report
Authorization: Bearer {token}

Parameters:
- email: patient@example.com
- bookingReference: ABC123
- testName: Full Blood Count

Response:
{
  "success": true,
  "message": "Report sent successfully"
}
```

---

## 📋 Frontend Usage

### Basic Usage in Components

```typescript
import { useDownloadBooking } from '../hooks/useDownloadBooking';
import BookingActions from '../components/BookingActions';

function MyComponent() {
  const { downloadReceipt, emailReceipt } = useDownloadBooking();

  return (
    <BookingActions 
      booking={booking}
      compact={true}
      showEmail={true}
      onActionComplete={() => {
        // Refresh bookings or close modal
      }}
    />
  );
}
```

### Programmatic Download

```typescript
const { downloadReceipt, downloadReport } = useDownloadBooking();

// Download receipt
await downloadReceipt(booking);

// Download report
await downloadReport(booking, testResults);

// Send via email
await emailReceipt(booking);
await emailReport(booking, testResults);
```

---

## ✨ Features Implemented

### PDF Generation
- ✅ Professional booking receipt with patient & test info
- ✅ Lab report template with sample results
- ✅ Custom styling with healthcare branding
- ✅ Status-based coloring and formatting

### Download Options
- ✅ Download single documents (receipt or report)
- ✅ Download both documents together
- ✅ Browser-native PDF download

### Email Integration
- ✅ Email with PDF attachments
- ✅ Secure base64 encoding of PDFs
- ✅ HTML email templates
- ✅ Mock mode for development/testing

### UI Components
- ✅ Compact button group (inline with booking card)
- ✅ Expanded card layout for detail pages
- ✅ Dropdown menu for quick actions
- ✅ Loading states and error handling
- ✅ Responsive design for mobile

---

## 🧪 Testing Checklist

### Frontend
- [ ] Open MyBookingsPage
- [ ] Verify BookingActions buttons appear
- [ ] Click "Receipt" button → PDF downloads
- [ ] Click "Report" button → PDF downloads (if status is COMPLETED)
- [ ] Click "More" menu → dropdown appears
- [ ] Verify responsive layout on mobile

### Backend
- [ ] Verify EmailController is accessible
- [ ] Test `/api/email/send-with-attachment` endpoint
- [ ] Check logs for email delivery confirmations
- [ ] Verify mock mode logs emails correctly

### Email
- [ ] Check inbox for sent emails (if configured)
- [ ] Verify PDF attachments are present
- [ ] Confirm email format is readable

---

## 🐛 Troubleshooting

### PDF Not Downloading
1. Check browser console for errors
2. Verify `jsPDF` package is installed
3. Clear browser cache and retry

### Email Not Sending
1. Check if email is enabled: `app.email.enabled=true`
2. Verify SMTP configuration in application.properties
3. Check backend logs for detailed error messages
4. Try mock mode: `app.email.mock=true`

### Gmail SMTP Issues
1. Verify "Less secure apps" is enabled (for older Gmail accounts)
2. Use app password instead of account password
3. Check "Security alert" notifications in Gmail
4. Enable "Display unlocked captcha" if prompted

### Base64 Encoding Issues
1. Ensure PDF is properly encoded in frontend
2. Remove `data:application/pdf;base64,` prefix if causes issues
3. Verify file size isn't too large (>5MB)

---

## 📊 Production Checklist

- [ ] Configure proper SMTP server (Gmail, SendGrid, AWS SES, etc.)
- [ ] Set environment variables for credentials
- [ ] Disable mock mode: `app.email.mock=false`
- [ ] Test with real email addresses
- [ ] Verify SSL/TLS for secure communication
- [ ] Monitor email delivery logs
- [ ] Set up email rate limiting if needed
- [ ] Implement retry logic for failed emails

---

## 📚 Dependencies Summary

### Frontend
- **jsPDF**: v2.5.1+ (PDF generation)
- **html2canvas**: v1.4.1+ (HTML to canvas conversion)

### Backend
- **spring-boot-starter-mail**: (Mail sending)
- **Spring Boot**: v3.0+ (provided in project)

---

## 🎯 Next Steps

1. Install npm dependencies: `npm install jspdf html2canvas`
2. Configure email settings in `application.properties`
3. Test the feature with the testing checklist above
4. Deploy to production with proper SMTP configuration

---

## 📞 Support

For issues or questions:
1. Check browser console and backend logs
2. Review backend logs at configured log level
3. Verify all configuration properties are set
4. Test with mock mode to isolate issues

---

**Document Version**: 1.0
**Last Updated**: 2024
**Status**: ✅ Complete
