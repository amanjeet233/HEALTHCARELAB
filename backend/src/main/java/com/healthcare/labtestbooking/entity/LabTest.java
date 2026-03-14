package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "lab_tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "test_code", nullable = false, unique = true)
    private String testCode;
    
    @Column(name = "test_name", nullable = false)
    private String testName;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private TestCategory category;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "test_type")
    private TestType testType;
    
    private String methodology;
    private String unit;
    
    @Column(name = "normal_range_min", precision = 12, scale = 4)
    private BigDecimal normalRangeMin;
    
    @Column(name = "normal_range_max", precision = 12, scale = 4)
    private BigDecimal normalRangeMax;
    
    @Column(name = "critical_low", precision = 12, scale = 4)
    private BigDecimal criticalLow;
    
    @Column(name = "critical_high", precision = 12, scale = 4)
    private BigDecimal criticalHigh;
    
    @Column(name = "normal_range_text", columnDefinition = "TEXT")
    private String normalRangeText;
    
    @Column(name = "pediatric_range", columnDefinition = "TEXT")
    private String pediatricRange;
    
    @Column(name = "male_range", columnDefinition = "TEXT")
    private String maleRange;
    
    @Column(name = "female_range", columnDefinition = "TEXT")
    private String femaleRange;
    
    @Column(name = "fasting_required")
    private Boolean fastingRequired;
    
    @Column(name = "fasting_hours")
    private Integer fastingHours;
    
    @Column(name = "report_time_hours")
    private Integer reportTimeHours;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- Relationships ---

    @OneToMany(mappedBy = "test", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<TestParameter> parameters = new ArrayList<>();

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<LabTestPricing> labTestPricings = new ArrayList<>();

    @ManyToMany(mappedBy = "tests", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<TestPackage> packages = new ArrayList<>();
}
