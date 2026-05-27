package com.fransgiddy.montessori.dto.fee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TeacherAnalyticsResponse(
        BigDecimal totalAmount,
        long feeCount,
        BigDecimal todayAmount,
        long todayCount,
        List<StudentSummary> topStudents,
        List<DailyEntry> dailyTrend,
        List<FeeResponse> recentEntries
) {
    public record StudentSummary(
            Long studentId,
            String studentName,
            String className,
            BigDecimal totalAmount,
            long count
    ) {}

    public record DailyEntry(
            LocalDate date,
            BigDecimal totalAmount,
            long count
    ) {}
}
