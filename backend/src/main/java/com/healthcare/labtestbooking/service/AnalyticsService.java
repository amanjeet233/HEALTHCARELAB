package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ChartDataDTO;
import com.healthcare.labtestbooking.dto.Period;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.PaymentRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final int DEFAULT_DAYS = 30;
    private static final int DEFAULT_MONTHS = 12;
    private static final List<PaymentStatus> REVENUE_STATUSES = List.of(
            PaymentStatus.SUCCESS,
            PaymentStatus.COMPLETED,
            PaymentStatus.PAID
    );

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public ChartDataDTO getDailyBookings(LocalDate start, LocalDate end) {
        DateRange range = normalizeDateRange(start, end, DEFAULT_DAYS);
        Map<LocalDate, Long> counts = toDateCountMap(
                bookingRepository.countBookingsByDateRange(range.start, range.end)
        );

        List<String> labels = new ArrayList<>();
        List<Number> values = new ArrayList<>();
        for (LocalDate date = range.start; !date.isAfter(range.end); date = date.plusDays(1)) {
            labels.add(date.toString());
            values.add(counts.getOrDefault(date, 0L));
        }

        return buildSingleSeries("Daily Bookings", labels, values, "#4f46e5");
    }

    public ChartDataDTO getPopularTests(int limit) {
        int safeLimit = limit > 0 ? limit : 10;
        List<Object[]> rows = bookingRepository.findTopBookedTests(PageRequest.of(0, safeLimit));

        List<String> labels = new ArrayList<>();
        List<Number> values = new ArrayList<>();
        for (Object[] row : rows) {
            labels.add(String.valueOf(row[0]));
            values.add(((Number) row[1]).longValue());
        }

        return buildSingleSeries("Top Tests", labels, values, "#16a34a");
    }

    public ChartDataDTO getRevenueByPeriod(Period period) {
        Period selected = period == null ? Period.DAILY : period;
        if (selected == Period.MONTHLY) {
            YearMonth end = YearMonth.now();
            YearMonth start = end.minusMonths(DEFAULT_MONTHS - 1);
            LocalDateTime startDateTime = start.atDay(1).atStartOfDay();
            LocalDateTime endDateTime = end.atEndOfMonth().atTime(23, 59, 59);

            Map<YearMonth, Number> totals = toMonthSumMap(
                    paymentRepository.sumRevenueByMonth(startDateTime, endDateTime, REVENUE_STATUSES)
            );

            List<String> labels = new ArrayList<>();
            List<Number> values = new ArrayList<>();
            for (YearMonth month = start; !month.isAfter(end); month = month.plusMonths(1)) {
                labels.add(month.toString());
                values.add(totals.getOrDefault(month, 0));
            }

            return buildSingleSeries("Monthly Revenue", labels, values, "#f97316");
        }

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(DEFAULT_DAYS - 1);
        Map<LocalDate, Number> totals = toDateSumMap(
                paymentRepository.sumRevenueByDateRange(start.atStartOfDay(), end.atTime(23, 59, 59), REVENUE_STATUSES)
        );

        List<String> labels = new ArrayList<>();
        List<Number> values = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            labels.add(date.toString());
            values.add(totals.getOrDefault(date, 0));
        }

        return buildSingleSeries("Daily Revenue", labels, values, "#f59e0b");
    }

    public ChartDataDTO getUserGrowth(Period period) {
        Period selected = period == null ? Period.DAILY : period;
        if (selected == Period.MONTHLY) {
            YearMonth end = YearMonth.now();
            YearMonth start = end.minusMonths(DEFAULT_MONTHS - 1);
            LocalDateTime startDateTime = start.atDay(1).atStartOfDay();
            LocalDateTime endDateTime = end.atEndOfMonth().atTime(23, 59, 59);

            Map<YearMonth, Number> totals = toMonthSumMap(
                    userRepository.countUsersByMonth(startDateTime, endDateTime)
            );

            List<String> labels = new ArrayList<>();
            List<Number> values = new ArrayList<>();
            for (YearMonth month = start; !month.isAfter(end); month = month.plusMonths(1)) {
                labels.add(month.toString());
                values.add(totals.getOrDefault(month, 0));
            }

            return buildSingleSeries("Monthly New Users", labels, values, "#06b6d4");
        }

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(DEFAULT_DAYS - 1);
        Map<LocalDate, Long> totals = toDateCountMap(
                userRepository.countUsersByDateRange(start.atStartOfDay(), end.atTime(23, 59, 59))
        );

        List<String> labels = new ArrayList<>();
        List<Number> values = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            labels.add(date.toString());
            values.add(totals.getOrDefault(date, 0L));
        }

        return buildSingleSeries("Daily New Users", labels, values, "#0ea5e9");
    }

    public ChartDataDTO getCancellationRate() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(DEFAULT_DAYS - 1);
        long total = bookingRepository.countByBookingDateBetween(start, end);
        long cancelled = bookingRepository.countByStatusAndBookingDateBetween(BookingStatus.CANCELLED, start, end);
        double rate = total == 0 ? 0 : (cancelled * 100.0) / total;

        List<String> labels = List.of("Cancellation Rate (%)");
        List<Number> values = List.of(rate);
        return buildSingleSeries("Cancellation Rate", labels, values, "#ef4444");
    }

    private ChartDataDTO buildSingleSeries(String label, List<String> labels, List<Number> values, String color) {
        ChartDataDTO.DatasetDTO dataset = ChartDataDTO.DatasetDTO.builder()
                .label(label)
                .data(values)
                .backgroundColor(color)
                .borderColor(color)
                .fill(false)
                .build();

        return ChartDataDTO.builder()
                .labels(labels)
                .datasets(List.of(dataset))
                .build();
    }

    private DateRange normalizeDateRange(LocalDate start, LocalDate end, int days) {
        LocalDate resolvedEnd = end == null ? LocalDate.now() : end;
        LocalDate resolvedStart = start == null ? resolvedEnd.minusDays(days - 1) : start;
        if (resolvedStart.isAfter(resolvedEnd)) {
            LocalDate temp = resolvedStart;
            resolvedStart = resolvedEnd;
            resolvedEnd = temp;
        }
        return new DateRange(resolvedStart, resolvedEnd);
    }

    private Map<LocalDate, Long> toDateCountMap(List<Object[]> rows) {
        Map<LocalDate, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = (LocalDate) row[0];
            Long count = ((Number) row[1]).longValue();
            map.put(date, count);
        }
        return map;
    }

    private Map<LocalDate, Number> toDateSumMap(List<Object[]> rows) {
        Map<LocalDate, Number> map = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = (LocalDate) row[0];
            Number total = (Number) row[1];
            map.put(date, total);
        }
        return map;
    }

    private Map<YearMonth, Number> toMonthSumMap(List<Object[]> rows) {
        Map<YearMonth, Number> map = new HashMap<>();
        for (Object[] row : rows) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            Number total = (Number) row[2];
            map.put(YearMonth.of(year, month), total);
        }
        return map;
    }

    private static class DateRange {
        private final LocalDate start;
        private final LocalDate end;

        private DateRange(LocalDate start, LocalDate end) {
            this.start = start;
            this.end = end;
        }
    }
}
