package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.subject.SubjectRequest;
import com.fransgiddy.montessori.entity.Subject;
import com.fransgiddy.montessori.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Subject>> createSubject(@Valid @RequestBody SubjectRequest request) {
        Subject subject = subjectService.createSubject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("Subject created successfully", subject));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects() {
        List<Subject> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(ApiResponse.of("Subjects retrieved successfully", subjects));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Subject>> getSubjectById(@PathVariable Long id) {
        Subject subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.of("Subject retrieved successfully", subject));
    }

    @GetMapping("/class/{classLevel}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByClassLevel(@PathVariable String classLevel) {
        List<Subject> subjects = subjectService.getSubjectsByClassLevel(classLevel);
        return ResponseEntity.ok(ApiResponse.of("Subjects retrieved successfully", subjects));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Subject>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        Subject subject = subjectService.updateSubject(id, request);
        return ResponseEntity.ok(ApiResponse.of("Subject updated successfully", subject));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.of("Subject deleted successfully", null));
    }
}
