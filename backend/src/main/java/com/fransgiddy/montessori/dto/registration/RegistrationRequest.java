package com.fransgiddy.montessori.dto.registration;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record RegistrationRequest(
        @NotBlank(message = "Parent name is required") String parentName,
        @NotBlank(message = "Phone number is required") String parentPhone,
        @NotBlank(message = "Child first name is required") String childFirstName,
        @NotBlank(message = "Child last name is required") String childLastName,
        LocalDate childDateOfBirth,
        String desiredClass,
        String message
) {}
