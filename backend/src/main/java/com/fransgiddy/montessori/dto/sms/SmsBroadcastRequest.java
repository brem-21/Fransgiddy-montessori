package com.fransgiddy.montessori.dto.sms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SmsBroadcastRequest(
        @NotBlank(message = "Message is required") String message,
        @NotNull(message = "Recipient type is required") RecipientType recipientType,
        List<String> customPhones
) {
    public enum RecipientType {
        ALL, PARENTS, TEACHERS, CUSTOM
    }
}
