package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.healthcare.labtestbooking.listener.AuditListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "test_packages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "package_code", nullable = false, unique = true)
    private String packageCode;
    
    @Column(name = "package_name", nullable = false)
    private String packageName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "total_tests")
    private Integer totalTests;
    
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    @Column(name = "discounted_price", precision = 10, scale = 2)
    private BigDecimal discountedPrice;
    
    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "testPackage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PackageTest> packageTests;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "package_tests",
        joinColumns = @JoinColumn(name = "package_id"),
        inverseJoinColumns = @JoinColumn(name = "test_id")
    )
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<LabTest> tests = new ArrayList<>();

    @OneToMany(mappedBy = "testPackage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();
}
