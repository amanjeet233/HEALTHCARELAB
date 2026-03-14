package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;

@Entity
@EntityListeners({AuditingEntityListener.class, AuditListener.class})
@Table(name = "family_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User patient;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String relation;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 5)
    private String bloodGroup;
}
