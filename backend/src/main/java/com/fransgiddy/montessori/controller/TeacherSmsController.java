package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.sms.SmsBroadcastRequest;
import com.fransgiddy.montessori.dto.sms.SmsContactResponse;
import com.fransgiddy.montessori.dto.sms.SmsRequestResponse;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.service.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/sms")
@PreAuthorize("hasRole('TEACHER')")
@RequiredArgsConstructor
public class TeacherSmsController {

    private final SmsService smsService;

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<SmsContactResponse>>> getContacts() {
        return ResponseEntity.ok(ApiResponse.of("Contacts", smsService.getContacts()));
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<SmsRequestResponse>> createRequest(
            @Valid @RequestBody SmsBroadcastRequest request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(ApiResponse.of("SMS request submitted for approval",
                smsService.createRequest(request, teacher)));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<SmsRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(ApiResponse.of("My SMS requests",
                smsService.getMyRequests(teacher.getId())));
    }
}
