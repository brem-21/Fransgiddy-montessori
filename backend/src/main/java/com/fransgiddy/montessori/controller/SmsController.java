package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.sms.*;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.service.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/sms")
@PreAuthorize("hasRole('PRINCIPAL')")
@RequiredArgsConstructor
public class SmsController {

    private final SmsService smsService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<SmsBroadcastResponse>> send(
            @Valid @RequestBody SmsBroadcastRequest request) {
        return ResponseEntity.ok(ApiResponse.of("SMS broadcast complete", smsService.send(request)));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getRecipientCounts() {
        int parents = smsService.countRecipients(SmsBroadcastRequest.RecipientType.PARENTS);
        int teachers = smsService.countRecipients(SmsBroadcastRequest.RecipientType.TEACHERS);
        return ResponseEntity.ok(ApiResponse.of("Recipient counts", Map.of(
                "parents", parents,
                "teachers", teachers,
                "all", parents + teachers
        )));
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<SmsContactResponse>>> getContacts() {
        return ResponseEntity.ok(ApiResponse.of("Contacts", smsService.getContacts()));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<SmsRequestResponse>>> getPendingRequests() {
        return ResponseEntity.ok(ApiResponse.of("Pending requests", smsService.getPendingRequests()));
    }

    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<ApiResponse<SmsBroadcastResponse>> approveRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal) {
        return ResponseEntity.ok(ApiResponse.of("Request approved and SMS sent",
                smsService.approveRequest(id, principal)));
    }

    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User principal) {
        smsService.rejectRequest(id, principal);
        return ResponseEntity.ok(ApiResponse.of("Request rejected", null));
    }
}
