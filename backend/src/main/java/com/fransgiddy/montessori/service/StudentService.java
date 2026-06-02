package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.student.StudentRequest;
import com.fransgiddy.montessori.dto.student.StudentResponse;
import com.fransgiddy.montessori.entity.Student;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.repository.SchoolClassRepository;
import com.fransgiddy.montessori.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
