package com.fransgiddy.montessori.dto.fee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record FeeResponse(
        Long id,
        String studentName,
        String studentClass,
        String collectedByName,
        BigDecimal amount,
        String description,
        LocalDate feeDate,
        LocalDateTime createdAt
) {}
