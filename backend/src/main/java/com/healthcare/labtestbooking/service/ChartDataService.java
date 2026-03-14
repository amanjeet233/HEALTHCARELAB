package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ChartDataDTO;
import com.healthcare.labtestbooking.dto.TrendDataDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChartDataService {

    public ChartDataDTO buildLineChart(TrendDataDTO trend, String title, BigDecimal normalValue) {
        List<ChartDataDTO.DatasetDTO> datasets = new ArrayList<>();
        datasets.add(dataset("Your Value", toNumbers(trend.getValues()), "#FF6384", "rgba(255,99,132,0.2)", null, false));

        if (normalValue != null && trend.getValues() != null) {
            List<Number> normalLine = new ArrayList<>();
            for (int i = 0; i < trend.getValues().size(); i++) {
                normalLine.add(normalValue);
            }
            datasets.add(dataset("Normal Range", normalLine, "#36A2EB", "rgba(54,162,235,0.1)", List.of(5, 5), false));
        }

        return ChartDataDTO.builder()
            .labels(trend.getLabels())
            .datasets(datasets)
            .options(defaultOptions(title))
            .build();
    }

    public ChartDataDTO buildBarComparison(List<String> labels, List<? extends Number> values, List<? extends Number> normalValues, String title) {
        List<ChartDataDTO.DatasetDTO> datasets = new ArrayList<>();
        datasets.add(dataset("Your Value", toNumbers(values), "#4BC0C0", "rgba(75,192,192,0.3)", null, true));

        if (normalValues != null) {
            datasets.add(dataset("Normal Range", toNumbers(normalValues), "#36A2EB", "rgba(54,162,235,0.1)", List.of(5, 5), true));
        }

        return ChartDataDTO.builder()
            .labels(labels)
            .datasets(datasets)
            .options(defaultOptions(title))
            .build();
    }

    public ChartDataDTO buildGaugeChart(String label, Number currentValue, Number min, Number max, String title) {
        List<String> labels = List.of(label);
        List<ChartDataDTO.DatasetDTO> datasets = List.of(
            dataset("Current", List.of(currentValue), "#FF9F40", "rgba(255,159,64,0.3)", null, true),
            dataset("Min", List.of(min), "#E0E0E0", "rgba(224,224,224,0.4)", null, true),
            dataset("Max", List.of(max), "#E0E0E0", "rgba(224,224,224,0.4)", null, true)
        );

        Map<String, Object> options = defaultOptions(title);
        options.put("gauge", Map.of("min", min, "max", max));

        return ChartDataDTO.builder()
            .labels(labels)
            .datasets(datasets)
            .options(options)
            .build();
    }

    public ChartDataDTO buildRadarChart(List<String> labels, List<? extends Number> values, List<? extends Number> normalValues, String title) {
        List<ChartDataDTO.DatasetDTO> datasets = new ArrayList<>();
        datasets.add(dataset("Your Value", toNumbers(values), "#9966FF", "rgba(153,102,255,0.2)", null, true));
        if (normalValues != null) {
            datasets.add(dataset("Normal Range", toNumbers(normalValues), "#36A2EB", "rgba(54,162,235,0.15)", List.of(5, 5), true));
        }

        return ChartDataDTO.builder()
            .labels(labels)
            .datasets(datasets)
            .options(defaultOptions(title))
            .build();
    }

    private ChartDataDTO.DatasetDTO dataset(String label, List<Number> data, String borderColor, String backgroundColor, List<Integer> borderDash, boolean fill) {
        return ChartDataDTO.DatasetDTO.builder()
            .label(label)
            .data(data)
            .borderColor(borderColor)
            .backgroundColor(backgroundColor)
            .borderDash(borderDash)
            .fill(fill)
            .build();
    }

    private List<Number> toNumbers(List<? extends Number> values) {
        if (values == null) {
            return List.of();
        }
        return new ArrayList<>(values);
    }

    private Map<String, Object> defaultOptions(String title) {
        Map<String, Object> options = new HashMap<>();
        options.put("responsive", true);
        options.put("title", title);
        return options;
    }
}
