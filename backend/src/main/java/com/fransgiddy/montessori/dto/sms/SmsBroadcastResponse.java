package com.fransgiddy.montessori.dto.sms;

public record SmsBroadcastResponse(
        int sent,
        int failed,
        String details
) {}
