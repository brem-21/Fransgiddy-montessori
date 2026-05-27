package com.fransgiddy.montessori.dto.student;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record StudentRequest(
        @NotBlank(message = "First name is required") String firstName,
        @NotBlank(message = "Last name is required") String lastName,
        @NotBlank(message = "Class name is required") String className,
        LocalDate dateOfBirth,
        String parentName,
        String parentPhone,
        LocalDate enrollmentDate
) {}
