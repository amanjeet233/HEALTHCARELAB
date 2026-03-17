package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ReportResultDTO;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.TestParameterRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.entity.Report;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TestParameterRepository testParameterRepository;
    private final ReportResultRepository reportResultRepository;
    private final ReportRepository reportRepository;

    @Transactional
    public void uploadReport(Long bookingId, MultipartFile file) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        try {
            Report report = new Report();
            report.setBooking(booking);
            report.setReportPdf(file.getBytes());
            report.setGeneratedDate(LocalDateTime.now());
            report.setReportPdfPath("uploaded_report_" + bookingId + ".pdf");
            reportRepository.save(report);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    @Transactional
    public void verifyReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setVerifiedBy(getCurrentUser().getEmail());
        report.setGeneratedDate(LocalDateTime.now());
        reportRepository.save(report);
    }

    public List<ReportResultDTO> getMyReports() {
        User patient = getCurrentUser();
        List<Booking> patientBookings = bookingRepository.findByPatientId(patient.getId());

        List<ReportResultDTO> allReports = new ArrayList<>();
        for (Booking booking : patientBookings) {
            try {
                allReports.add(getReportByBookingId(booking.getId()));
            } catch (Exception e) {
                // Skip bookings without reports
            }
        }
        return allReports;
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public ReportResultDTO enterReportResults(ReportResultRequest request) {
        log.info("Entering report results for booking ID: {}", request.getBookingId());

        // Get booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + request.getBookingId()));

        // Always use the authenticated technician for attribution.
        // This avoids client-side coupling to numeric IDs and prevents impersonation.
        User technician = getCurrentUser();

        // Link booking to technician if not already assigned
        if (booking.getTechnician() == null) {
            booking.setTechnician(technician);
            bookingRepository.save(booking);
        }

        List<ReportResult> savedResults = new ArrayList<>();

        // Process each result item
        for (ReportResultRequest.ResultItem item : request.getResults()) {
            TestParameter parameter = testParameterRepository.findById(item.getParameterId())
                    .orElseThrow(() -> new RuntimeException("Parameter not found with id: " + item.getParameterId()));

            ReportResult result = new ReportResult();
            result.setBooking(booking);
            result.setParameter(parameter);
            result.setResultValue(item.getResultValue());
            result.setUnit(item.getUnit());
            result.setNormalRange(item.getNormalRange());
            result.setNotes(item.getNotes());

            // Calculate abnormal status
            AbnormalStatus status = calculateAbnormalStatus(parameter, item.getResultValue());
            result.setAbnormalStatus(status);

            // Set isAbnormal and isCritical flags
            result.setIsAbnormal(status != null && status != AbnormalStatus.NORMAL);
            result.setIsCritical(status == AbnormalStatus.CRITICAL_LOW || status == AbnormalStatus.CRITICAL_HIGH);

            savedResults.add(reportResultRepository.save(result));
        }

        // Convert to DTO and return
        return convertToDTO(savedResults, booking, technician);
    }

    public ReportResultDTO getReportByBookingId(Long bookingId) {
        log.info("Fetching report for booking ID: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);

        if (results.isEmpty()) {
            throw new RuntimeException("No report results found for booking id: " + bookingId);
        }

        User technician = results.get(0).getBooking().getTechnician();
        return convertToDTO(results, booking, technician);
    }

    private AbnormalStatus calculateAbnormalStatus(TestParameter parameter, String resultValueStr) {
        if (resultValueStr == null || resultValueStr.isEmpty()) {
            return AbnormalStatus.NORMAL;
        }

        try {
            BigDecimal resultValue = new BigDecimal(resultValueStr);

            // Check critical ranges first
            if (parameter.getCriticalLow() != null && resultValue.compareTo(parameter.getCriticalLow()) < 0) {
                return AbnormalStatus.CRITICAL_LOW;
            }
            if (parameter.getCriticalHigh() != null && resultValue.compareTo(parameter.getCriticalHigh()) > 0) {
                return AbnormalStatus.CRITICAL_HIGH;
            }

            // Check normal ranges
            if (parameter.getNormalRangeMin() != null && resultValue.compareTo(parameter.getNormalRangeMin()) < 0) {
                return AbnormalStatus.LOW;
            }
            if (parameter.getNormalRangeMax() != null && resultValue.compareTo(parameter.getNormalRangeMax()) > 0) {
                return AbnormalStatus.HIGH;
            }

            return AbnormalStatus.NORMAL;
        } catch (NumberFormatException e) {
            log.warn("Could not parse result value: {}", resultValueStr);
            return AbnormalStatus.NORMAL;
        }
    }

    private ReportResultDTO convertToDTO(List<ReportResult> results, Booking booking, User technician) {
        ReportResultDTO dto = new ReportResultDTO();
        dto.setBookingId(booking.getId());
        dto.setTechnicianId(technician != null ? technician.getId() : null);
        dto.setSubmittedAt(LocalDateTime.now());

        List<ReportResultDTO.ResultItemDTO> itemDTOs = results.stream()
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
        dto.setResults(itemDTOs);

        return dto;
    }

    private ReportResultDTO.ResultItemDTO convertToItemDTO(ReportResult result) {
        ReportResultDTO.ResultItemDTO itemDTO = new ReportResultDTO.ResultItemDTO();
        itemDTO.setId(result.getId());
        itemDTO.setParameterId(result.getParameter().getId());
        itemDTO.setParameterName(result.getParameter().getParameterName());
        itemDTO.setResultValue(result.getResultValue());
        itemDTO.setUnit(result.getUnit());

        // Format normal range
        String normalRange = "";
        if (result.getParameter().getNormalRangeMin() != null && result.getParameter().getNormalRangeMax() != null) {
            normalRange = result.getParameter().getNormalRangeMin() + " - " + result.getParameter().getNormalRangeMax();
        }
        itemDTO.setNormalRange(normalRange);

        itemDTO.setAbnormalStatus(result.getAbnormalStatus() != null ? result.getAbnormalStatus().name() : null);
        itemDTO.setIsAbnormal(result.getIsAbnormal());
        itemDTO.setIsCritical(result.getIsCritical());

        return itemDTO;
    }
}