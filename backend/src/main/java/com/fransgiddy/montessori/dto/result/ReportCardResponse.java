package com.fransgiddy.montessori.dto.result;

import java.util.List;

public record ReportCardResponse(
        String studentName,
        String className,
        String term,
        String academicYear,
        List<ReportCardEntry> results,
        double totalScore,
        double average,
        String overallGrade
) {
    public record ReportCardEntry(
            String subjectName,
            double score,
            String grade,
            String remarks
    ) {}
}
