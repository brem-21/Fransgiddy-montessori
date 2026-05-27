package com.fransgiddy.montessori.dto.result;

import com.fransgiddy.montessori.enums.Term;

public record ResultResponse(
        Long id,
        String studentName,
        String subjectName,
        Term term,
        String academicYear,
        Double score,
        String grade,
        String remarks,
        String teacherName
) {}
