package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.announcement.AnnouncementRequest;
import com.fransgiddy.montessori.dto.announcement.AnnouncementResponse;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.service.AnnouncementService;
import com.fransgiddy.montessori.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final FileStorageService fileStorageService;

    @GetMapping("/api/public/announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getPublishedAnnouncements() {
        List<AnnouncementResponse> announcements = announcementService.getPublished();
        return ResponseEntity.ok(ApiResponse.of("Announcements retrieved successfully", announcements));
    }

    @GetMapping("/api/admin/announcements")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllAnnouncements() {
        List<AnnouncementResponse> announcements = announcementService.getAll();
        return ResponseEntity.ok(ApiResponse.of("Announcements retrieved successfully", announcements));
    }

    @PostMapping("/api/admin/announcements")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request,
            @AuthenticationPrincipal User currentUser) {
        AnnouncementResponse announcement = announcementService.create(request, currentUser.getPhone());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("Announcement created successfully", announcement));
    }

    @PutMapping("/api/admin/announcements/{id}")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request) {
        AnnouncementResponse announcement = announcementService.update(id, request);
        return ResponseEntity.ok(ApiResponse.of("Announcement updated successfully", announcement));
    }

    @PatchMapping("/api/admin/announcements/{id}/publish")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> publishAnnouncement(@PathVariable Long id) {
        AnnouncementResponse announcement = announcementService.publish(id);
        return ResponseEntity.ok(ApiResponse.of("Announcement published successfully", announcement));
    }

    @DeleteMapping("/api/admin/announcements/{id}")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.ok(ApiResponse.of("Announcement deleted successfully", null));
    }

    @PostMapping("/api/admin/announcements/{id}/media")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> uploadMedia(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String url = fileStorageService.store(file, "announcements");
        return ResponseEntity.ok(ApiResponse.of("Media uploaded", announcementService.addMedia(id, url)));
    }
}
