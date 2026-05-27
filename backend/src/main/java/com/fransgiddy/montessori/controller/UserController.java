package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.user.CreateTeacherRequest;
import com.fransgiddy.montessori.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('PRINCIPAL')")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<Map<String, Object>> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.of("Users retrieved successfully", users));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTeacher(
            @Valid @RequestBody CreateTeacherRequest request) {
        Map<String, Object> user = userService.createTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("Teacher created successfully", user));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleUserActive(@PathVariable Long id) {
        Map<String, Object> user = userService.toggleUserActive(id);
        return ResponseEntity.ok(ApiResponse.of("User status toggled", user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.of("User deleted successfully", null));
    }
}
