package com.fransgiddy.montessori.dto.auth;

public record LoginResponse(
        Long id,
        String token,
        String name,
        String phone,
        String role
) {}
