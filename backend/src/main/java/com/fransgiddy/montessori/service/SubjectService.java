package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.subject.SubjectRequest;
import com.fransgiddy.montessori.entity.Subject;
import com.fransgiddy.montessori.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    @Transactional
    public Subject createSubject(SubjectRequest request) {
        Subject subject = Subject.builder()
                .name(request.name())
                .classLevel(request.classLevel())
                .build();
        return subjectRepository.save(subject);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
    }

    public List<Subject> getSubjectsByClassLevel(String classLevel) {
        return subjectRepository.findByClassLevel(classLevel);
    }

    @Transactional
    public Subject updateSubject(Long id, SubjectRequest request) {
        Subject subject = getSubjectById(id);
        subject.setName(request.name());
        subject.setClassLevel(request.classLevel());
        return subjectRepository.save(subject);
    }

    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new RuntimeException("Subject not found with id: " + id);
        }
        subjectRepository.deleteById(id);
    }
}
