import jsPDF from 'jspdf';
import { BookingResponse } from '../types/booking';

/**
 * ✅ GENERATE BOOKING RECEIPT PDF
 * Creates a professional PDF receipt for a test booking
 */
export const generateBookingReceipt = (booking: BookingResponse): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const formatDate = (value?: string) => {
    if (!value) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = () => {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (value: number) =>
    `Rs ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fitText = (text: string, maxWidth: number) => {
    const safe = String(text || '').trim();
    if (!safe) return '-';
    if (doc.getTextWidth(safe) <= maxWidth) return safe;
    let value = safe;
    while (value.length > 3 && doc.getTextWidth(`${value}...`) > maxWidth) {
      value = value.slice(0, -1);
    }
    return `${value}...`;
  };

  const amount = Number(booking.amount ?? booking.finalAmount ?? booking.totalAmount ?? 0);
  const discount = Number(booking.discount ?? 0);
  const subtotal = Number(booking.totalAmount ?? amount + discount);
  const testName = booking.testName || booking.labTestName || booking.packageName || 'Diagnostic Test';
  const category = booking.packageName ? 'Package' : 'Pathology';
  const bookingId = booking.bookingReference || booking.reference || `HLAB-${booking.id}`;
  const paid = String(booking.paymentStatus || '').toUpperCase() !== 'FAILED' && String(booking.status || '').toUpperCase() !== 'CANCELLED';

  // page background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // card container
  const cardX = 16;
  const cardY = 14;
  const cardW = pageWidth - 32;
  const cardH = pageHeight - 28;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardX, cardY, cardW, cardH, 5, 5, 'FD');

  // top accent
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(cardX, cardY, cardW, 2.5, 1.2, 1.2, 'F');

  // header brand
  let y = cardY + 14;
  const leftX = cardX + 6;
  const rightX = cardX + cardW - 6;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const brandPrefix = 'HEALTHCARE';
  const brandSuffix = 'LAB';
  doc.text(brandPrefix, leftX, y);
  const labX = leftX + doc.getTextWidth(brandPrefix) + 0.8;
  doc.setTextColor(37, 99, 235);
  doc.text(brandSuffix, labX, y);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Smart Diagnostics, Trusted Care', leftX, y + 5.5);

  // receipt label + paid badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIPT', rightX, y, { align: 'right' });
  doc.setFillColor(paid ? 220 : 254, paid ? 252 : 242, paid ? 231 : 226);
  doc.roundedRect(rightX - 13, y + 2.2, 13, 6, 3, 3, 'F');
  doc.setTextColor(paid ? 21 : 185, paid ? 128 : 28, paid ? 61 : 28);
  doc.setFontSize(7);
  doc.text(paid ? 'PAID' : 'UNPAID', rightX - 6.5, y + 6.2, { align: 'center' });

  // divider
  doc.setDrawColor(241, 245, 249);
  doc.line(leftX, y + 10, rightX, y + 10);

  // details
  y += 18;
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT NAME', leftX, y);
  doc.text('BOOKING ID', rightX, y, { align: 'right' });

  y += 4.6;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  const patientValue = fitText(booking.patientName || 'Patient', 70);
  const bookingIdValue = fitText(`#${bookingId}`, 58);
  doc.text(patientValue, leftX, y);
  doc.text(bookingIdValue, rightX, y, { align: 'right' });

  y += 8;
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('CONTACT', leftX, y);
  doc.text('DATE & TIME', rightX, y, { align: 'right' });

  y += 4.6;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  const contactValue = fitText(booking.patientPhone || booking.patientEmail || 'N/A', 70);
  const dateTimeValue = fitText(`${formatDate(booking.bookingDate || booking.collectionDate)} | ${booking.timeSlot || booking.scheduledTime || '09:00 AM'}`, 58);
  doc.text(contactValue, leftX, y);
  doc.text(dateTimeValue, rightX, y, { align: 'right' });

  y += 8.5;
  doc.setDrawColor(241, 245, 249);
  doc.line(leftX, y, rightX, y);

  // table header
  y += 9;
  doc.setFillColor(248, 250, 252);
  doc.rect(leftX, y - 5.5, cardW - 12, 8, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Test Description', cardX + 8, y);
  doc.text('Category', cardX + 78, y, { align: 'left' });
  doc.text('Amount', rightX - 2, y, { align: 'right' });

  // table row
  y += 8.2;
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  const wrappedTest = doc.splitTextToSize(testName, 64);
  doc.text(wrappedTest, cardX + 8, y);
  doc.text(fitText(category, 28), cardX + 78, y);
  doc.text(fitText(formatMoney(amount), 30), rightX - 2, y, { align: 'right' });

  y += Math.max(7, wrappedTest.length * 4.3) + 8;

  // totals block
  const totalsX = cardX + cardW - 58;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal', totalsX, y);
  doc.setTextColor(51, 65, 85);
  doc.text(fitText(formatMoney(subtotal), 30), rightX - 2, y, { align: 'right' });

  y += 7;
  doc.setTextColor(100, 116, 139);
  doc.text('Discount', totalsX, y);
  doc.setTextColor(239, 68, 68);
  doc.text(fitText(`- ${formatMoney(discount)}`, 30), rightX - 2, y, { align: 'right' });

  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(totalsX, y, rightX - 2, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text('Total Amount', totalsX, y);
  doc.text(fitText(formatMoney(amount), 30), rightX - 2, y, { align: 'right' });

  // footer
  const fy = cardY + cardH - 20;
  doc.setDrawColor(241, 245, 249);
  doc.line(leftX, fy - 6, rightX, fy - 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated receipt and does not require a physical signature.', cardX + cardW / 2, fy, { align: 'center' });
  doc.text(`Generated: ${formatDateTime()} | support@healthcarelab.com`, cardX + cardW / 2, fy + 4.5, { align: 'center' });

  return doc;
};

/**
 * ✅ GENERATE LAB REPORT PDF
 * Creates a professional PDF report (template) for lab results
 */
export const generateLabReport = (booking: BookingResponse, results?: Record<string, any>): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // ✅ HEADER
  doc.setFillColor(13, 124, 124);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('⚕️ HEALTHCARE LAB REPORT', margin, yPosition + 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CLIA Certified | ISO Accredited | NABL Certified', margin, yPosition + 20);
  doc.text('Reg: Lab-001 | Ph: +91 7783856140 | Email: support@healthlab.com', margin, yPosition + 25);

  yPosition += 45;

  // ✅ PATIENT HEADER
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', margin, yPosition);
  yPosition += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${booking.patientName || 'N/A'}`, margin, yPosition);
  doc.text(`Report ID: ${booking.bookingReference}`, margin + 80, yPosition);
  yPosition += 4;

  doc.text(`Age: N/A`, margin, yPosition);
  doc.text(`Collection Date: ${new Date(booking.collectionDate).toLocaleDateString('en-IN')}`, margin + 80, yPosition);
  yPosition += 4;

  doc.text(`Gender: N/A`, margin, yPosition);
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, margin + 80, yPosition);
  yPosition += 7;

  // ✅ TEST INFORMATION
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TEST DETAILS', margin, yPosition);
  yPosition += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Test: ${booking.testName}`, margin, yPosition);
  yPosition += 4;
  doc.text(`Sample Type: ${booking.sampleType || 'Blood'}`, margin, yPosition);
  yPosition += 7;

  // ✅ RESULTS SECTION
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TEST RESULTS', margin, yPosition);
  yPosition += 5;

  if (results && Object.keys(results).length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    Object.entries(results).forEach(([key, value]) => {
      const displayKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
      doc.text(`${displayKey}:`, margin, yPosition);
      doc.text(String(value), margin + 60, yPosition);
      yPosition += 4;
    });
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('Results will be updated once the lab analysis is complete.', margin, yPosition);
    doc.setTextColor(0, 0, 0);
  }

  yPosition += 8;

  // ✅ REMARKS SECTION
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SPECIAL NOTES', margin, yPosition);
  yPosition += 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const specialNotes = booking.specialNotes || 'No special notes.';
  const splitNotes = doc.splitTextToSize(specialNotes, 170);
  doc.text(splitNotes, margin, yPosition);
  yPosition += splitNotes.length * 4 + 5;

  // ✅ FOOTER
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  const reportFooter = [
    'This report is confidential and legally valid. Results are accurate as per the test standards.',
    'Consult your doctor for medical advice. Do not self-medicate based on these results.',
    `Generated: ${new Date().toLocaleString('en-IN')} | Report ID: ${booking.bookingReference}`
  ];

  const pageHeight = doc.internal.pageSize.getHeight();
  yPosition = pageHeight - 20;

  reportFooter.forEach((text) => {
    doc.text(text, margin, yPosition, { maxWidth: 170, align: 'center' });
    yPosition += 3;
  });

  return doc;
};

/**
 * ✅ DOWNLOAD PDF HELPER
 * Triggers browser download of PDF file
 */
export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};

/**
 * ✅ GET STATUS COLOR
 * Returns RGB color based on booking status
 */
const getStatusColor = (status: string): [number, number, number] => {
  switch (status) {
    case 'CONFIRMED':
      return [76, 175, 80]; // Green
    case 'PENDING_CONFIRMATION':
      return [255, 152, 0]; // Orange
    case 'SAMPLE_COLLECTED':
      return [33, 150, 243]; // Blue
    case 'COMPLETED':
      return [76, 175, 80]; // Green
    case 'CANCELLED':
      return [244, 67, 54]; // Red
    default:
      return [100, 100, 100]; // Gray
  }
};

/**
 * ✅ SEND EMAIL WITH ATTACHMENT
 * Sends PDF receipt/report via email (integrates with backend)
 */
export const sendPDFViaEmail = async (
  email: string,
  subject: string,
  pdfDoc: jsPDF,
  filename: string
): Promise<boolean> => {
  try {
    // Convert PDF to base64
    const pdfBlob = pdfDoc.output('blob');
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onload = async () => {
        const base64PDF = reader.result as string;

        // Call backend API to send email
        const response = await fetch('/api/email/send-with-attachment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            toEmail: email,
            subject: subject,
            body: `Please find your ${filename} attached.`,
            attachmentBase64: base64PDF,
            attachmentFilename: filename,
            attachmentMimeType: 'application/pdf'
          })
        });

        resolve(response.ok);
      };

      reader.readAsDataURL(pdfBlob);
    });
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return false;
  }
};
