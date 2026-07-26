package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.student.StudentRequest;
import com.fransgiddy.montessori.dto.student.StudentResponse;
import com.fransgiddy.montessori.entity.Student;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.excel.ExcelUtil;
import com.fransgiddy.montessori.excel.ImportMode;
import com.fransgiddy.montessori.excel.ImportResult;
import com.fransgiddy.montessori.excel.ImportRowError;
import com.fransgiddy.montessori.repository.SchoolClassRepository;
import com.fransgiddy.montessori.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        Student student = Student.builder()
                .firstName(strip(request.firstName()))
                .lastName(strip(request.lastName()))
                .className(strip(request.className()))
                .dateOfBirth(request.dateOfBirth())
                .parentName(strip(request.parentName()))
                .parentPhone(strip(request.parentPhone()))
                .enrollmentDate(request.enrollmentDate())
                .active(true)
                .build();

        student = studentRepository.save(student);
        return toResponse(student);
    }

    public List<StudentResponse> getAllStudents(User requester) {
        if (requester.getRole() == Role.PRINCIPAL) {
            return studentRepository.findByActiveTrue().stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        // TEACHER — only return students from their assigned classes
        Set<String> myClassNames = schoolClassRepository.findByTeachersId(requester.getId())
                .stream()
                .map(c -> c.getName())
                .collect(Collectors.toSet());
        if (myClassNames.isEmpty()) return List.of();
        return studentRepository.findByClassNameInAndActiveTrue(myClassNames).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<StudentResponse> getStudentsByClass(String className) {
        return studentRepository.findByClassNameAndActiveTrue(className).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        student.setFirstName(strip(request.firstName()));
        student.setLastName(strip(request.lastName()));
        student.setClassName(strip(request.className()));
        student.setDateOfBirth(request.dateOfBirth());
        student.setParentName(strip(request.parentName()));
        student.setParentPhone(strip(request.parentPhone()));
        student.setEnrollmentDate(request.enrollmentDate());

        student = studentRepository.save(student);
        return toResponse(student);
    }

    @Transactional
    public void deactivateStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        student.setActive(false);
        studentRepository.save(student);
    }

    private static final String[] IMPORT_HEADERS = {
            "First Name", "Last Name", "Class", "Date of Birth", "Parent Name", "Parent Phone", "Enrollment Date"
    };

    public byte[] generateTemplate() {
        return ExcelUtil.buildTemplate("Students", IMPORT_HEADERS,
                new String[]{"Jane", "Doe", "Primary 3", "2016-04-12", "John Doe", "0244123456", "2023-09-01"});
    }

    @Transactional
    public ImportResult importFromExcel(MultipartFile file, ImportMode mode) throws IOException {
        List<Map<String, String>> rows = ExcelUtil.readRows(file);
        int created = 0, updated = 0, skipped = 0;
        List<ImportRowError> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            int rowNum = i + 2; // header is row 1
            Map<String, String> row = rows.get(i);
            try {
                String firstName = strip(required(row, "First Name"));
                String lastName = strip(required(row, "Last Name"));
                String className = strip(required(row, "Class"));
                LocalDate dob = ExcelUtil.parseDate(required(row, "Date of Birth"));
                String parentName = strip(row.getOrDefault("Parent Name", ""));
                String parentPhone = strip(row.getOrDefault("Parent Phone", ""));
                String enrollmentRaw = row.get("Enrollment Date");
                LocalDate enrollmentDate = (enrollmentRaw == null || enrollmentRaw.isBlank())
                        ? null : ExcelUtil.parseDate(enrollmentRaw);

                Optional<Student> existing = studentRepository
                        .findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndDateOfBirth(firstName, lastName, dob);

                if (existing.isPresent()) {
                    if (mode == ImportMode.SKIP_DUPLICATES) {
                        skipped++;
                        continue;
                    }
                    Student student = existing.get();
                    student.setClassName(className);
                    student.setParentName(parentName);
                    student.setParentPhone(parentPhone);
                    if (enrollmentDate != null) student.setEnrollmentDate(enrollmentDate);
                    studentRepository.save(student);
                    updated++;
                } else {
                    Student student = Student.builder()
                            .firstName(firstName)
                            .lastName(lastName)
                            .className(className)
                            .dateOfBirth(dob)
                            .parentName(parentName)
                            .parentPhone(parentPhone)
                            .enrollmentDate(enrollmentDate)
                            .active(true)
                            .build();
                    studentRepository.save(student);
                    created++;
                }
            } catch (Exception e) {
                errors.add(new ImportRowError(rowNum, e.getMessage()));
            }
        }
        return new ImportResult(created, updated, skipped, errors);
    }

    private static String required(Map<String, String> row, String key) {
        String value = row.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("\"" + key + "\" is required");
        }
        return value;
    }

    private static String strip(String input) {
        if (input == null) return null;
        return Jsoup.clean(input, Safelist.none());
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getClassName(),
                student.getDateOfBirth(),
                student.getParentName(),
                student.getParentPhone(),
                student.getEnrollmentDate(),
                student.isActive(),
                student.getCreatedAt()
        );
    }
}
