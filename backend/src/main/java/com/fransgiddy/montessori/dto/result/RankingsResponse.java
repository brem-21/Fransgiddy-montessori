package com.fransgiddy.montessori.dto.result;

import java.util.List;
import java.util.Map;

public record RankingsResponse(
    List<String> subjects,
    List<StudentRanking> rankings
) {
    public record StudentRanking(
        int rank,
        Long studentId,
        String studentName,
        Map<String, Double> scores,
        double total,
        double average,
        String overallGrade
    ) {}
}
