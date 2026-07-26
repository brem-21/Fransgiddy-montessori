package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.subject.SubjectRequest;
import com.fransgiddy.montessori.entity.Subject;
import com.fransgiddy.montessori.excel.ExcelUtil;
import com.fransgiddy.montessori.excel.ImportMode;
import com.fransgiddy.montessori.excel.ImportResult;
import com.fransgiddy.montessori.excel.ImportRowError;
import com.fransgiddy.montessori.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    private static final String[] IMPORT_HEADERS = {"Subject Name", "Class Level"};

    public byte[] generateTemplate() {
        return ExcelUtil.buildTemplate("Subjects", IMPORT_HEADERS,
                new String[]{"Mathematics", "Primary 3"});
    }

    @Transactional
    public ImportResult importFromExcel(MultipartFile file, ImportMode mode) throws IOException {
        List<Map<String, String>> rows = ExcelUtil.readRows(file);
        int created = 0, updated = 0, skipped = 0;
        List<ImportRowError> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            int rowNum = i + 2;
            Map<String, String> row = rows.get(i);
            try {
                String name = required(row, "Subject Name");
                String classLevel = required(row, "Class Level");

                Optional<Subject> existing = subjectRepository
                        .findByNameIgnoreCaseAndClassLevelIgnoreCase(name, classLevel);
                if (existing.isPresent()) {
                    if (mode == ImportMode.SKIP_DUPLICATES) {
                        skipped++;
                        continue;
                    }
                    Subject subject = existing.get();
                    subject.setName(name);
                    subject.setClassLevel(classLevel);
                    subjectRepository.save(subject);
                    updated++;
                } else {
                    Subject subject = Subject.builder()
                            .name(name)
                            .classLevel(classLevel)
                            .build();
                    subjectRepository.save(subject);
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
}
