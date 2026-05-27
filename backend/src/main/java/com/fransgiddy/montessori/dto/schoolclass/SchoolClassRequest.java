package com.fransgiddy.montessori.dto.schoolclass;
import jakarta.validation.constraints.NotBlank;
public record SchoolClassRequest(@NotBlank String name, String description) {}
