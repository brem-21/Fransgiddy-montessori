package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.schoolclass.*;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.service.SchoolClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/classes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PRINCIPAL')")
public class SchoolClassController {

    private final SchoolClassService classService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SchoolClassResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.of("Classes retrieved", classService.getAll()));
    }

    @GetMapping("/my-classes")
    @PreAuthorize("hasRole('PRINCIPAL') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<SchoolClassResponse>>> getMyClasses(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.of("Classes retrieved", classService.getMyClasses(currentUser)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SchoolClassResponse>> create(@Valid @RequestBody SchoolClassRequest request) {
        SchoolClassResponse response = classService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of("Class created", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        classService.delete(id);
        return ResponseEntity.ok(ApiResponse.of("Class deleted", null));
    }

    @PutMapping("/{id}/teachers")
    public ResponseEntity<ApiResponse<SchoolClassResponse>> assignTeachers(
            @PathVariable Long id,
            @RequestBody AssignTeachersRequest request) {
        return ResponseEntity.ok(ApiResponse.of("Teachers assigned", classService.assignTeachers(id, request)));
    }

    @PutMapping("/{id}/students")
    public ResponseEntity<ApiResponse<SchoolClassResponse>> assignStudents(
            @PathVariable Long id,
            @RequestBody AssignStudentsRequest request) {
        return ResponseEntity.ok(ApiResponse.of("Students assigned", classService.assignStudents(id, request)));
    }
}
