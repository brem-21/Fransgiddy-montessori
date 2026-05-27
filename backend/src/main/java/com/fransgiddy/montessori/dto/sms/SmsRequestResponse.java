package com.fransgiddy.montessori.dto.sms;

import com.fransgiddy.montessori.enums.SmsRequestStatus;

import java.time.LocalDateTime;
import java.util.List;

public record SmsRequestResponse(
        Long id,
        String message,
        SmsBroadcastRequest.RecipientType recipientType,
        List<String> customPhones,
        SmsRequestStatus status,
        String requestedByName,
        String reviewedByName,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {}
