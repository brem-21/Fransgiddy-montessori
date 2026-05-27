package com.fransgiddy.montessori.dto.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record RegistrationRequest(
        @NotBlank(message = "Parent name is required") String parentName,
        @NotBlank(message = "Parent email is required") @Email(message = "Must be a valid email") String parentEmail,
        String parentPhone,
        @NotBlank(message = "Child first name is required") String childFirstName,
        @NotBlank(message = "Child last name is required") String childLastName,
        LocalDate childDateOfBirth,
        String desiredClass,
        String message
) {}
