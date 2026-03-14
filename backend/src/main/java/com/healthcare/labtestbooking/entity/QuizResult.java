package com.healthcare.labtestbooking.entity;

import com.healthcare.labtestbooking.listener.AuditListener;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners({ AuditingEntityListener.class, AuditListener.class })
@Table(name = "quiz_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "quiz_type", length = 50)
    @Builder.Default
    private String quizType = "HEALTH_ASSESSMENT";

    @Lob
    @Column(name = "answers_json", columnDefinition = "JSON", nullable = false)
    private String answersJson;

    @Column(name = "score")
    private Integer score;

    @Lob
    @Column(name = "recommendations_json", columnDefinition = "JSON")
    private String recommendationsJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
