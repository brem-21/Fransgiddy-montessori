package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.schoolclass.*;
import com.fransgiddy.montessori.entity.SchoolClass;
import com.fransgiddy.montessori.entity.Student;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.repository.SchoolClassRepository;
import com.fransgiddy.montessori.repository.StudentRepository;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolClassService {

    private final SchoolClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public List<SchoolClassResponse> getAll() {
        return classRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SchoolClassResponse> getMyClasses(User currentUser) {
        List<SchoolClass> classes = currentUser.getRole() == Role.PRINCIPAL
                ? classRepository.findAll()
                : classRepository.findByTeachersId(currentUser.getId());
        return classes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SchoolClassResponse create(SchoolClassRequest request) {
        if (classRepository.existsByName(request.name())) {
            throw new RuntimeException("A class named '" + request.name() + "' already exists.");
        }
        SchoolClass sc = SchoolClass.builder()
                .name(request.name())
                .description(request.description())
                .build();
        return toResponse(classRepository.save(sc));
    }

    @Transactional
    public void delete(Long id) {
        SchoolClass sc = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        classRepository.delete(sc);
    }

    @Transactional
    public SchoolClassResponse assignTeachers(Long classId, AssignTeachersRequest request) {
        SchoolClass sc = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        List<User> teachers = userRepository.findAllById(request.teacherIds());
        sc.setTeachers(teachers);
        return toResponse(classRepository.save(sc));
    }

    @Transactional
    public SchoolClassResponse assignStudents(Long classId, AssignStudentsRequest request) {
        SchoolClass sc = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        List<Student> students = studentRepository.findAllById(request.studentIds());
        for (Student s : students) {
            s.setClassName(sc.getName());
        }
        studentRepository.saveAll(students);
        return toResponse(sc);
    }

    private SchoolClassResponse toResponse(SchoolClass sc) {
        long studentCount = studentRepository.countByClassName(sc.getName());
        List<Long> teacherIds = sc.getTeachers().stream().map(User::getId).collect(Collectors.toList());
        List<String> teacherNames = sc.getTeachers().stream().map(User::getName).collect(Collectors.toList());
        return new SchoolClassResponse(sc.getId(), sc.getName(), sc.getDescription(), teacherIds, teacherNames, studentCount);
    }
}
