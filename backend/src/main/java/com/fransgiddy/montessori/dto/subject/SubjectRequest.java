package com.fransgiddy.montessori.dto.subject;

import jakarta.validation.constraints.NotBlank;

public record SubjectRequest(
        @NotBlank(message = "Subject name is required") String name,
        @NotBlank(message = "Class level is required") String classLevel
) {}
