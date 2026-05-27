package com.fransgiddy.montessori.dto.sms;

public record SmsContactResponse(
        Long id,
        String name,
        String phone,
        String type   // "PARENT" or "TEACHER"
) {}
