package com.fransgiddy.montessori.dto.announcement;

import com.fransgiddy.montessori.enums.AnnouncementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AnnouncementRequest(
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "Content is required") String content,
        @NotNull(message = "Type is required") AnnouncementType type,
        boolean published
) {}
