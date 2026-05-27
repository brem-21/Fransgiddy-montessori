package com.fransgiddy.montessori.dto.schoolclass;
import java.util.List;
public record SchoolClassResponse(
    Long id, String name, String description,
    List<Long> teacherIds, List<String> teacherNames,
    long studentCount
) {}
