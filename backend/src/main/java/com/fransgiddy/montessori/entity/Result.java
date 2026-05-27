package com.fransgiddy.montessori.entity;

import com.fransgiddy.montessori.enums.Term;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "results")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Term term;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private Double score;

    private String grade;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void computeGrade() {
        if (score != null) {
            if (score >= 80) {
                grade = "A";
            } else if (score >= 70) {
                grade = "B";
            } else if (score >= 60) {
                grade = "C";
            } else if (score >= 50) {
                grade = "D";
            } else {
                grade = "F";
            }
        }
    }
}
