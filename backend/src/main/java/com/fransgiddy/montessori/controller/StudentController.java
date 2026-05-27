package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.student.StudentRequest;
import com.fransgiddy.montessori.dto.student.StudentResponse;
import com.fransgiddy.montessori.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(@Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("Student created successfully", student));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents() {
        List<StudentResponse> students = studentService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.of("Students retrieved successfully", students));
    }

    @GetMapping("/class/{className}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getStudentsByClass(@PathVariable String className) {
        List<StudentResponse> students = studentService.getStudentsByClass(className);
        return ResponseEntity.ok(ApiResponse.of("Students retrieved successfully", students));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.of("Student updated successfully", student));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateStudent(@PathVariable Long id) {
        studentService.deactivateStudent(id);
        return ResponseEntity.ok(ApiResponse.of("Student deactivated successfully", null));
    }
}
