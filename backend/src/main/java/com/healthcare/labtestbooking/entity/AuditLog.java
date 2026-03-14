package com.healthcare.labtestbooking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String entityName;

    @Column(nullable = false, length = 64)
    private String entityId;

    @Column(nullable = false, length = 10)
    private String action;

    private Long userId;

    @Column(length = 120)
    private String username;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String newValue;
}
