package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.result.ResultRequest;
import com.fransgiddy.montessori.dto.result.ResultResponse;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.service.ResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ResultResponse>> enterResult(
            @Valid @RequestBody ResultRequest request,
            @AuthenticationPrincipal User currentUser) {
        ResultResponse result = resultService.enterResult(request, currentUser.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("Result saved successfully", result));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<ResultResponse>>> getStudentResults(@PathVariable Long studentId) {
        List<ResultResponse> results = resultService.getStudentResults(studentId);
        return ResponseEntity.ok(ApiResponse.of("Results retrieved successfully", results));
    }

    @GetMapping("/report-card")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<ResultResponse>>> getStudentReportCard(
            @RequestParam Long studentId,
            @RequestParam String term,
            @RequestParam String academicYear) {
        List<ResultResponse> results = resultService.getStudentReportCard(studentId, term, academicYear);
        return ResponseEntity.ok(ApiResponse.of("Report card retrieved successfully", results));
    }

    @GetMapping("/my-entries")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<ResultResponse>>> getMyEntries(@AuthenticationPrincipal User currentUser) {
        List<ResultResponse> results = resultService.getTeacherResults(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.of("Results retrieved successfully", results));
    }
}
