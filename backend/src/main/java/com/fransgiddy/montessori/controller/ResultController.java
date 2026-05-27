package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.result.RankingsResponse;
import com.fransgiddy.montessori.dto.result.ReportCardResponse;
import com.fransgiddy.montessori.dto.result.ResultRequest;
import com.fransgiddy.montessori.dto.result.ResultResponse;
import com.fransgiddy.montessori.dto.result.TranscriptResponse;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.repository.SchoolClassRepository;
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
    private final SchoolClassRepository schoolClassRepository;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<ResultResponse>> enterResult(
            @Valid @RequestBody ResultRequest request,
            @AuthenticationPrincipal User currentUser) {
        ResultResponse result = resultService.enterResult(request, currentUser.getPhone());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("Result saved successfully", result));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('PRINCIPAL') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<ResultResponse>>> getStudentResults(@PathVariable Long studentId) {
        List<ResultResponse> results = resultService.getStudentResults(studentId);
        return ResponseEntity.ok(ApiResponse.of("Results retrieved successfully", results));
    }

    @GetMapping("/report-card")
    @PreAuthorize("hasRole('PRINCIPAL') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ReportCardResponse>> getStudentReportCard(
            @RequestParam Long studentId,
            @RequestParam String term,
            @RequestParam String academicYear,
            @AuthenticationPrincipal User currentUser) {
        ReportCardResponse reportCard = resultService.getStudentReportCard(studentId, term, academicYear, currentUser);
        return ResponseEntity.ok(ApiResponse.of("Report card retrieved successfully", reportCard));
    }

    @GetMapping("/my-entries")
    @PreAuthorize("hasRole('TEACHER') or hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<List<ResultResponse>>> getMyEntries(@AuthenticationPrincipal User currentUser) {
        List<ResultResponse> results = resultService.getTeacherResults(currentUser.getPhone());
        return ResponseEntity.ok(ApiResponse.of("Results retrieved successfully", results));
    }

    @GetMapping("/transcript")
    @PreAuthorize("hasRole('PRINCIPAL')")
    public ResponseEntity<ApiResponse<TranscriptResponse>> getTranscript(
            @RequestParam Long studentId) {
        TranscriptResponse transcript = resultService.getStudentTranscript(studentId);
        return ResponseEntity.ok(ApiResponse.of("Transcript retrieved successfully", transcript));
    }

    @GetMapping("/rankings")
    @PreAuthorize("hasRole('PRINCIPAL') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<RankingsResponse>> getRankings(
            @RequestParam String className,
            @RequestParam String term,
            @RequestParam String academicYear,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser.getRole() == Role.TEACHER &&
                !schoolClassRepository.existsByTeachersIdAndName(currentUser.getId(), className)) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.of("You are not assigned to this class.", null));
        }
        RankingsResponse rankings = resultService.getRankings(className, term, academicYear);
        return ResponseEntity.ok(ApiResponse.of("Rankings retrieved successfully", rankings));
    }
}
