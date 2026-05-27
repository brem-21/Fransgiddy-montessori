package com.fransgiddy.montessori.dto.announcement;

import com.fransgiddy.montessori.enums.AnnouncementType;

import java.time.LocalDateTime;
import java.util.List;

public record AnnouncementResponse(
        Long id,
        String title,
        String content,
        AnnouncementType type,
        boolean published,
        String authorName,
        LocalDateTime createdAt,
        List<String> mediaUrls
) {}
