package com.fransgiddy.montessori.controller;

import com.fransgiddy.montessori.dto.ApiResponse;
import com.fransgiddy.montessori.dto.user.CreateTeacherRequest;
import com.fransgiddy.montessori.excel.ImportMode;
import com.fransgiddy.montessori.excel.ImportResult;
import com.fransgiddy.montessori.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImportResult>> importUsers(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "UPSERT") ImportMode mode) throws IOException {
        ImportResult result = userService.importFromExcel(file, mode);
        return ResponseEntity.ok(ApiResponse.of("Import completed", result));
    }

    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadUserTemplate() {
        byte[] bytes = userService.generateTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"teachers_template.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
}
