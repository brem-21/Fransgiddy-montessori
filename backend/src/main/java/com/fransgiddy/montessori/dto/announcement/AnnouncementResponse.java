package com.fransgiddy.montessori.dto.announcement;

import com.fransgiddy.montessori.enums.AnnouncementType;

import java.time.LocalDateTime;

public record AnnouncementResponse(
        Long id,
        String title,
        String content,
        AnnouncementType type,
        boolean published,
        String authorName,
        LocalDateTime createdAt
) {}
