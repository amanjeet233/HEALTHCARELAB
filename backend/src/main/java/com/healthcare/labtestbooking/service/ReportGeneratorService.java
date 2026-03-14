package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportGeneratorService {

    private static final DeviceRgb CRITICAL_RED = new DeviceRgb(139, 0, 0);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final ReportRepository reportRepository;
    private final ReportResultRepository reportResultRepository;
    private final ReportVerificationRepository reportVerificationRepository;

    public byte[] generatePdfReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));

        Booking booking = report.getBooking();
        Order order = report.getOrder();
        User patient = resolvePatient(booking, order);
        List<ReportResult> results = resolveResults(reportId, report);
        String doctorComments = resolveDoctorComments(booking);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument, PageSize.A4);

        document.add(new Paragraph("Lab Test Report")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(18)
                .setBold());

        document.add(new Paragraph("Generated: " + formatDateTime(LocalDateTime.now()))
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10));

        addPatientSection(document, patient);
        addOrderSection(document, report, booking, order);
        addResultsSection(document, results);
        addDoctorComments(document, doctorComments);
        addQrCode(document, reportId);

        document.close();
        return outputStream.toByteArray();
    }

    private User resolvePatient(Booking booking, Order order) {
        if (booking != null) {
            return booking.getPatient();
        }
        if (order != null) {
            return order.getUser();
        }
        return null;
    }

    private List<ReportResult> resolveResults(Long reportId, Report report) {
        if (report.getResults() != null && !report.getResults().isEmpty()) {
            return report.getResults();
        }
        return reportResultRepository.findByReportId(reportId);
    }

    private String resolveDoctorComments(Booking booking) {
        if (booking == null) {
            return null;
        }
        Optional<ReportVerification> verification = reportVerificationRepository.findByBookingId(booking.getId());
        return verification.map(ReportVerification::getClinicalNotes).orElse(null);
    }

    private void addPatientSection(Document document, User patient) {
        document.add(sectionHeader("Patient Details"));
        if (patient == null) {
            document.add(new Paragraph("Patient information is not available."));
            return;
        }

        document.add(new Paragraph("Name: " + safeValue(patient.getName())));
        document.add(new Paragraph("Email: " + safeValue(patient.getEmail())));
        document.add(new Paragraph("Phone: " + safeValue(patient.getPhone())));
        document.add(new Paragraph("Gender: " + safeValue(patient.getGender())));
        document.add(new Paragraph("Date of Birth: " + safeValue(patient.getDateOfBirth())));
    }

    private void addOrderSection(Document document, Report report, Booking booking, Order order) {
        document.add(sectionHeader("Order Details"));
        document.add(new Paragraph("Report ID: " + report.getId()));

        if (booking != null) {
            document.add(new Paragraph("Booking Reference: " + safeValue(booking.getBookingReference())));
            document.add(new Paragraph("Booking Date: " + safeValue(booking.getBookingDate())));
            document.add(new Paragraph("Collection Type: " + safeValue(booking.getCollectionType())));
            if (booking.getTest() != null) {
                document.add(new Paragraph("Test: " + safeValue(booking.getTest().getTestName())));
            }
            if (booking.getTestPackage() != null) {
                document.add(new Paragraph("Package: " + safeValue(booking.getTestPackage().getPackageName())));
            }
            return;
        }

        if (order != null) {
            document.add(new Paragraph("Order ID: " + order.getId()));
            if (order.getTest() != null) {
                document.add(new Paragraph("Test: " + safeValue(order.getTest().getTestName())));
            }
            if (order.getTestPackage() != null) {
                document.add(new Paragraph("Package: " + safeValue(order.getTestPackage().getPackageName())));
            }
        }
    }

    private void addResultsSection(Document document, List<ReportResult> results) {
        document.add(sectionHeader("Test Results"));
        if (results == null || results.isEmpty()) {
            document.add(new Paragraph("No results available."));
            return;
        }

        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 2, 3}))
                .useAllAvailableWidth();
        table.addHeaderCell(headerCell("Parameter"));
        table.addHeaderCell(headerCell("Result"));
        table.addHeaderCell(headerCell("Unit"));
        table.addHeaderCell(headerCell("Normal Range"));

        for (ReportResult result : results) {
            TestParameter parameter = result.getParameter();
            String normalRange = buildNormalRange(parameter, result);
            Cell parameterCell = new Cell().add(safeText(parameter != null ? parameter.getParameterName() : null));
            Cell resultCell = new Cell().add(safeText(resolveResultValue(result)));
            Cell unitCell = new Cell().add(safeText(result.getUnit()));
            Cell rangeCell = new Cell().add(safeText(normalRange));

            if (Boolean.TRUE.equals(result.getIsCritical())) {
                resultCell.setFontColor(ColorConstants.WHITE).setBackgroundColor(CRITICAL_RED);
            } else if (Boolean.TRUE.equals(result.getIsAbnormal())) {
                resultCell.setFontColor(ColorConstants.WHITE).setBackgroundColor(ColorConstants.RED);
            }

            table.addCell(parameterCell);
            table.addCell(resultCell);
            table.addCell(unitCell);
            table.addCell(rangeCell);
        }

        document.add(table);
    }

    private void addDoctorComments(Document document, String comments) {
        document.add(sectionHeader("Doctor's Comments"));
        if (comments == null || comments.isBlank()) {
            document.add(new Paragraph("No comments provided."));
            return;
        }
        document.add(new Paragraph(comments));
    }

    private void addQrCode(Document document, Long reportId) {
        document.add(sectionHeader("Verification"));
        String qrContent = "report:" + reportId;
        BarcodeQRCode qrCode = new BarcodeQRCode(qrContent);
        PdfFormXObject qrObject = qrCode.createFormXObject(ColorConstants.BLACK, document.getPdfDocument());
        Image qrImage = new Image(qrObject).setWidth(120).setHeight(120);
        document.add(qrImage);
        document.add(new Paragraph("Scan to verify report ID: " + reportId));
    }

    private Paragraph sectionHeader(String title) {
        return new Paragraph(title).setBold().setFontSize(12).setMarginTop(12);
    }

    private Cell headerCell(String value) {
        return new Cell().add(new Paragraph(value).setBold());
    }

    private Paragraph safeText(Object value) {
        return new Paragraph(safeValue(value));
    }

    private String safeValue(Object value) {
        return value == null ? "-" : String.valueOf(value);
    }

    private String resolveResultValue(ReportResult result) {
        if (result.getResultValue() != null && !result.getResultValue().isBlank()) {
            return result.getResultValue();
        }
        return result.getValue();
    }

    private String buildNormalRange(TestParameter parameter, ReportResult result) {
        if (parameter != null && parameter.getNormalRangeMin() != null && parameter.getNormalRangeMax() != null) {
            return parameter.getNormalRangeMin() + " - " + parameter.getNormalRangeMax();
        }
        if (result.getNormalRange() != null) {
            return result.getNormalRange();
        }
        if (result.getNormalRangeMin() != null && result.getNormalRangeMax() != null) {
            return result.getNormalRangeMin() + " - " + result.getNormalRangeMax();
        }
        return "-";
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "-" : DATE_TIME_FORMATTER.format(dateTime);
    }
}
