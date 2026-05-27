package com.fransgiddy.montessori.dto.student;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record StudentResponse(
        Long id,
        String firstName,
        String lastName,
        String className,
        LocalDate dateOfBirth,
        String parentName,
        String parentPhone,
        String parentEmail,
        LocalDate enrollmentDate,
        boolean active,
        LocalDateTime createdAt
) {}
