package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.student.StudentRequest;
import com.fransgiddy.montessori.dto.student.StudentResponse;
import com.fransgiddy.montessori.entity.Student;
import com.fransgiddy.montessori.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        Student student = Student.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .className(request.className())
                .dateOfBirth(request.dateOfBirth())
                .parentName(request.parentName())
                .parentPhone(request.parentPhone())
                .parentEmail(request.parentEmail())
                .enrollmentDate(request.enrollmentDate())
                .active(true)
                .build();

        student = studentRepository.save(student);
        return toResponse(student);
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<StudentResponse> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className).stream()
                .filter(Student::isActive)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setClassName(request.className());
        student.setDateOfBirth(request.dateOfBirth());
        student.setParentName(request.parentName());
        student.setParentPhone(request.parentPhone());
        student.setParentEmail(request.parentEmail());
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

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getClassName(),
                student.getDateOfBirth(),
                student.getParentName(),
                student.getParentPhone(),
                student.getParentEmail(),
                student.getEnrollmentDate(),
                student.isActive(),
                student.getCreatedAt()
        );
    }
}
