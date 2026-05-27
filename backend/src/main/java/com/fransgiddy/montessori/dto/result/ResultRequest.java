package com.fransgiddy.montessori.dto.result;

import com.fransgiddy.montessori.enums.Term;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResultRequest(
        @NotNull(message = "Student ID is required") Long studentId,
        @NotNull(message = "Subject ID is required") Long subjectId,
        @NotNull(message = "Term is required") Term term,
        @NotBlank(message = "Academic year is required") String academicYear,
        @NotNull(message = "Score is required")
        @DecimalMin(value = "0.0", message = "Score must be at least 0")
        @DecimalMax(value = "100.0", message = "Score must not exceed 100")
        Double score,
        String remarks
) {}
