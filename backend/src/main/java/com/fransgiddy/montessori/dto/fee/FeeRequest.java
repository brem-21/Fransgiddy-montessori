package com.fransgiddy.montessori.dto.fee;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FeeRequest(
        @NotNull(message = "Student ID is required") Long studentId,
        @NotNull(message = "Amount is required") @Positive(message = "Amount must be positive") BigDecimal amount,
        String description,
        LocalDate feeDate
) {}
