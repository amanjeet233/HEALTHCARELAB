package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners({ AuditingEntityListener.class, AuditListener.class })
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "phone")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.PATIENT;

    @Column(unique = true, length = 15)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 5)
    private String bloodGroup;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(name = "reset_password_token", length = 100)
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;

    // --- Relationships ---

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<Booking> patientBookings = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<FamilyMember> familyMembers = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<HealthScore> healthScores = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
