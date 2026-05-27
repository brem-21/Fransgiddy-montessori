package com.fransgiddy.montessori.dto.result;

import java.util.List;

public record TranscriptResponse(
        Long studentId,
        String studentName,
        String className,
        String parentName,
        String parentPhone,
        String enrollmentDate,
        List<TermRecord> terms
) {
    public record TermRecord(
            String academicYear,
            String term,
            List<SubjectEntry> subjects,
            double totalScore,
            double average,
            String overallGrade,
            int position,
            int totalStudents
    ) {}

    public record SubjectEntry(
            String subjectName,
            double score,
            String grade,
            String remarks
    ) {}
}
