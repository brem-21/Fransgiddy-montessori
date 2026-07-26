package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.fee.FeeRequest;
import com.fransgiddy.montessori.dto.fee.FeeResponse;
import com.fransgiddy.montessori.dto.fee.PrincipalAnalyticsResponse;
import com.fransgiddy.montessori.dto.fee.TeacherAnalyticsResponse;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.excel.ImportMode;
import com.fransgiddy.montessori.excel.ImportResult;
import com.fransgiddy.montessori.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @PostMapping
    @PreAuthorize("hasRole('PRINCIPAL') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<FeeResponse>> enterFee(
            @Valid @RequestBody FeeRequest request,
            @AuthenticationPrincipal User currentUser) {
        FeeResponse response = feeService.enterFee(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("Fee recorded successfully", response));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> getAllFees(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String className) {
        List<FeeResponse> fees = feeService.getAllFees(startDate, endDate, teacherId, studentId, className);
        return ResponseEntity.ok(ApiResponse.of("Fees retrieved successfully", fees));
    }

    @GetMapping("/my-fees")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> getMyFees(
            @AuthenticationPrincipal User currentUser) {
        List<FeeResponse> fees = feeService.getMyFees(currentUser.getPhone());
        return ResponseEntity.ok(ApiResponse.of("Fees retrieved successfully", fees));
    }

    @GetMapping("/my-analytics")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<TeacherAnalyticsResponse>> getMyAnalytics(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        TeacherAnalyticsResponse analytics = feeService.getTeacherAnalytics(
                currentUser.getPhone(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.of("Analytics retrieved successfully", analytics));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<PrincipalAnalyticsResponse>> getPrincipalAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String className) {
        PrincipalAnalyticsResponse analytics = feeService.getPrincipalAnalytics(
                startDate, endDate, teacherId, studentId, className);
        return ResponseEntity.ok(ApiResponse.of("Analytics retrieved successfully", analytics));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('PRINCIPAL') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> getFeesByStudent(
            @PathVariable Long studentId) {
        List<FeeResponse> fees = feeService.getFeesByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.of("Student fees retrieved successfully", fees));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PRINCIPAL') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ImportResult>> importFees(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "UPSERT") ImportMode mode,
            @AuthenticationPrincipal User currentUser) throws IOException {
        ImportResult result = feeService.importFromExcel(file, mode, currentUser);
        return ResponseEntity.ok(ApiResponse.of("Import completed", result));
    }

    @GetMapping("/import/template")
    @PreAuthorize("hasRole('PRINCIPAL') or hasRole('TEACHER')")
    public ResponseEntity<byte[]> downloadFeeTemplate() {
        byte[] bytes = feeService.generateTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fees_template.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
}
