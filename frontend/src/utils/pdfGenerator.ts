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
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // ✅ HEADER
  doc.setFillColor(13, 124, 124); // Teal color
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('⚕️ HEALTHCARE LAB', margin, yPosition + 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Trusted Diagnostics Partner', margin, yPosition + 20);

  yPosition += 35;

  // ✅ RECEIPT TITLE
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING RECEIPT', margin, yPosition);
  yPosition += 12;

  // ✅ BOOKING ID & DATE
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const receiptDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`Receipt Date: ${receiptDate}`, margin, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Booking Reference: ${booking.bookingReference}`, margin, yPosition);
  yPosition += 12;

  // ✅ PATIENT INFORMATION
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const patientInfo = [
    [`Name:`, booking.patientName || 'N/A'],
    [`Email:`, booking.patientEmail || 'N/A'],
    [`Phone:`, booking.patientPhone],
    [`Address:`, booking.collectionAddress || 'Not specified'],
    [`Pincode:`, booking.pincode]
  ];

  patientInfo.forEach((item) => {
    const [label, value] = item;
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 30, yPosition);
    yPosition += 5;
  });

  yPosition += 6;

  // ✅ TEST INFORMATION
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TEST INFORMATION', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const testInfo = [
    [`Test Name:`, booking.testName],
    [`Sample Type:`, booking.sampleType || 'Blood/Default'],
    [`Collection Type:`, booking.collectionType === 'LAB' ? 'Lab Collection' : 'Home Collection'],
    [`Collection Date:`, new Date(booking.collectionDate).toLocaleDateString('en-IN')],
    [`Report Time:`, `${booking.reportTimeHours || 24} hours`]
  ];

  testInfo.forEach((item) => {
    const [label, value] = item;
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 35, yPosition);
    yPosition += 5;
  });

  yPosition += 6;

  // ✅ BOOKING STATUS
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING STATUS', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  const statusText = booking.status.replace(/_/g, ' ');
  const statusColor = getStatusColor(booking.status);
  doc.setTextColor(...statusColor);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText.toUpperCase(), margin, yPosition);
  yPosition += 6;

  // ✅ PAYMENT INFORMATION
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const paymentInfo = [
    [`Amount:`, `₹${booking.amount.toFixed(2)}`],
    [`Payment Status:`, booking.paymentStatus || 'Pending'],
    [`Payment Method:`, booking.paymentMethod || 'Not specified']
  ];

  paymentInfo.forEach((item) => {
    const [label, value] = item;
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 30, yPosition);
    yPosition += 5;
  });

  yPosition += 12;

  // ✅ FOOTER
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  const footerText = [
    'This is an official receipt for your booking. Please keep it safe for future reference.',
    'For any queries, contact us at support@healthlab.com or call +91 7783856140',
    `Generated on: ${new Date().toLocaleString('en-IN')}`
  ];

  footerText.forEach((text) => {
    doc.text(text, margin, yPosition, { maxWidth: contentWidth, align: 'center' });
    yPosition += 4;
  });

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
