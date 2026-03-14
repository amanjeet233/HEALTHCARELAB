package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.entity.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_health_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserHealthData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    private Integer age;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(precision = 5, scale = 2)
    private BigDecimal height;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "chronic_conditions", columnDefinition = "TEXT")
    private String chronicConditions;

    @Column(columnDefinition = "TEXT")
    private String medications;

    @Column(columnDefinition = "TEXT")
    private String surgeries;

    @Column(name = "family_history", columnDefinition = "TEXT")
    private String familyHistory;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relation", length = 50)
    private String emergencyContactRelation;

    @Column(name = "dietary_preferences", columnDefinition = "TEXT")
    private String dietaryPreferences;

    @Column(name = "lifestyle_factors", columnDefinition = "TEXT")
    private String lifestyleFactors;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
