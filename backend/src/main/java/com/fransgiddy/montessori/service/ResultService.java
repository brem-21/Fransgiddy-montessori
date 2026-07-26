package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.result.RankingsResponse;
import com.fransgiddy.montessori.dto.result.ReportCardResponse;
import com.fransgiddy.montessori.dto.result.ResultRequest;
import com.fransgiddy.montessori.dto.result.ResultResponse;
import com.fransgiddy.montessori.dto.result.TranscriptResponse;
import com.fransgiddy.montessori.entity.Result;
import com.fransgiddy.montessori.entity.Student;
import com.fransgiddy.montessori.entity.Subject;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Term;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.excel.ExcelUtil;
import com.fransgiddy.montessori.excel.ImportMode;
import com.fransgiddy.montessori.excel.ImportResult;
import com.fransgiddy.montessori.excel.ImportRowError;
import com.fransgiddy.montessori.repository.ResultRepository;
import com.fransgiddy.montessori.repository.SchoolClassRepository;
import com.fransgiddy.montessori.repository.StudentRepository;
import com.fransgiddy.montessori.repository.SubjectRepository;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;

    @Transactional
    public ResultResponse enterResult(ResultRequest request, String teacherPhone) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.studentId()));

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + request.subjectId()));

        User teacher = userRepository.findByPhone(teacherPhone)
                .orElseThrow(() -> new RuntimeException("Teacher not found with phone: " + teacherPhone));

        if (teacher.getRole() == Role.TEACHER &&
                !schoolClassRepository.existsByTeachersIdAndName(teacher.getId(), student.getClassName())) {
            throw new RuntimeException("You are not assigned to this student's class.");
        }

        Optional<Result> existingResult = resultRepository.findByStudentIdAndSubjectIdAndTermAndAcademicYear(
                request.studentId(), request.subjectId(), request.term(), request.academicYear());

        Result result;
        if (existingResult.isPresent()) {
            result = existingResult.get();
            result.setScore(request.score());
            result.setRemarks(request.remarks());
            result.setTeacher(teacher);
        } else {
            result = Result.builder()
                    .student(student)
                    .subject(subject)
                    .teacher(teacher)
                    .term(request.term())
                    .academicYear(request.academicYear())
                    .score(request.score())
                    .remarks(request.remarks())
                    .build();
        }

        result = resultRepository.save(result);
        return toResponse(result);
    }

    public List<ResultResponse> getStudentResults(Long studentId) {
        return resultRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReportCardResponse getStudentReportCard(Long studentId, String termStr, String academicYear, User requester) {
        Term term = Term.valueOf(termStr.toUpperCase());

        if (requester.getRole() == Role.TEACHER) {
            Student s = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
            if (!schoolClassRepository.existsByTeachersIdAndName(requester.getId(), s.getClassName())) {
                throw new RuntimeException("You are not assigned to this student's class.");
            }
        }

        List<Result> results = resultRepository.findByStudentIdAndTermAndAcademicYear(studentId, term, academicYear);
        if (results.isEmpty()) throw new RuntimeException("No results found for this student and period.");

        Student student = results.get(0).getStudent();
        List<ReportCardResponse.ReportCardEntry> entries = results.stream()
                .map(r -> new ReportCardResponse.ReportCardEntry(
                        r.getSubject().getName(), r.getScore(), r.getGrade(), r.getRemarks()
                )).collect(Collectors.toList());

        double total = results.stream().mapToDouble(Result::getScore).sum();
        double average = total / results.size();
        String overallGrade = average >= 80 ? "A" : average >= 70 ? "B" : average >= 60 ? "C" : average >= 50 ? "D" : "F";

        // Compute position within class for this term/year
        List<Result> classResults = resultRepository.findByClassNameAndTermAndAcademicYear(student.getClassName(), term, academicYear);
        Map<Long, Double> studentTotals = classResults.stream()
                .collect(Collectors.groupingBy(r -> r.getStudent().getId(), Collectors.summingDouble(Result::getScore)));
        int totalStudents = studentTotals.size();
        int position = (int) studentTotals.entrySet().stream()
                .filter(e -> e.getValue() > total)
                .count() + 1;

        return new ReportCardResponse(
                student.getFirstName() + " " + student.getLastName(),
                student.getClassName(),
                termStr,
                academicYear,
                entries,
                total,
                average,
                overallGrade,
                position,
                totalStudents
        );
    }

    public TranscriptResponse getStudentTranscript(Long studentId) {
        List<Result> allResults = resultRepository.findByStudentId(studentId);
        if (allResults.isEmpty()) throw new RuntimeException("No results found for this student.");

        Student student = allResults.get(0).getStudent();

        // Pre-fetch all results for the class once to avoid one query per term/year
        List<Result> allClassResults = resultRepository.findByStudentClassName(student.getClassName());
        Map<String, Map<Term, List<Result>>> classResultsByYearAndTerm = allClassResults.stream()
                .collect(Collectors.groupingBy(
                        Result::getAcademicYear,
                        Collectors.groupingBy(Result::getTerm)
                ));

        // Group student results by academicYear then by term
        Map<String, Map<Term, List<Result>>> grouped = allResults.stream()
                .collect(Collectors.groupingBy(
                        Result::getAcademicYear,
                        Collectors.groupingBy(Result::getTerm)
                ));

        List<TranscriptResponse.TermRecord> termRecords = new ArrayList<>();
        grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(yearEntry -> {
                    String year = yearEntry.getKey();
                    yearEntry.getValue().entrySet().stream()
                            .sorted(Comparator.comparingInt(e -> e.getKey().ordinal()))
                            .forEach(termEntry -> {
                                Term term = termEntry.getKey();
                                List<Result> termResults = termEntry.getValue();

                                List<TranscriptResponse.SubjectEntry> subjects = termResults.stream()
                                        .map(r -> new TranscriptResponse.SubjectEntry(
                                                r.getSubject().getName(), r.getScore(), r.getGrade(), r.getRemarks()))
                                        .sorted(Comparator.comparing(TranscriptResponse.SubjectEntry::subjectName))
                                        .collect(Collectors.toList());

                                double total = termResults.stream().mapToDouble(Result::getScore).sum();
                                double average = total / termResults.size();
                                String grade = average >= 80 ? "A" : average >= 70 ? "B" : average >= 60 ? "C" : average >= 50 ? "D" : "F";

                                // Position in class using pre-fetched data (no extra DB call per term)
                                List<Result> classResults = classResultsByYearAndTerm
                                        .getOrDefault(year, Map.of())
                                        .getOrDefault(term, List.of());
                                Map<Long, Double> studentTotals = classResults.stream()
                                        .collect(Collectors.groupingBy(r -> r.getStudent().getId(), Collectors.summingDouble(Result::getScore)));
                                int totalStudents = studentTotals.size();
                                int position = (int) studentTotals.entrySet().stream()
                                        .filter(e -> e.getValue() > total)
                                        .count() + 1;

                                termRecords.add(new TranscriptResponse.TermRecord(
                                        year, term.name(), subjects, total, average, grade, position, totalStudents));
                            });
                });

        return new TranscriptResponse(
                student.getId(),
                student.getFirstName() + " " + student.getLastName(),
                student.getClassName(),
                student.getParentName(),
                student.getParentPhone(),
                student.getEnrollmentDate().toString(),
                termRecords
        );
    }

    public List<ResultResponse> getTeacherResults(String teacherPhone) {
        User teacher = userRepository.findByPhone(teacherPhone)
                .orElseThrow(() -> new RuntimeException("Teacher not found with phone: " + teacherPhone));

        return resultRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RankingsResponse getRankings(String className, String termStr, String academicYear) {
        Term term = Term.valueOf(termStr.toUpperCase());
        List<Result> results = resultRepository.findByClassNameAndTermAndAcademicYear(className, term, academicYear);
        if (results.isEmpty()) return new RankingsResponse(List.of(), List.of());

        // Collect all unique subjects
        List<String> subjects = results.stream()
                .map(r -> r.getSubject().getName())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        // Group by student
        Map<Long, List<Result>> byStudent = results.stream()
                .collect(Collectors.groupingBy(r -> r.getStudent().getId()));

        // Build student rows
        List<RankingsResponse.StudentRanking> unsorted = byStudent.entrySet().stream()
                .map(entry -> {
                    List<Result> studentResults = entry.getValue();
                    Result first = studentResults.get(0);
                    String studentName = first.getStudent().getFirstName() + " " + first.getStudent().getLastName();

                    Map<String, Double> scores = studentResults.stream()
                            .collect(Collectors.toMap(
                                    r -> r.getSubject().getName(),
                                    Result::getScore,
                                    (a, b) -> a,
                                    java.util.LinkedHashMap::new
                            ));

                    double total = studentResults.stream().mapToDouble(Result::getScore).sum();
                    double average = total / studentResults.size();
                    String grade = average >= 80 ? "A" : average >= 70 ? "B" : average >= 60 ? "C" : average >= 50 ? "D" : "F";

                    return new RankingsResponse.StudentRanking(0, entry.getKey(), studentName, scores, total, average, grade);
                })
                .sorted(Comparator.comparingDouble(RankingsResponse.StudentRanking::total).reversed())
                .collect(Collectors.toList());

        // Assign ranks
        List<RankingsResponse.StudentRanking> ranked = new java.util.ArrayList<>();
        for (int i = 0; i < unsorted.size(); i++) {
            RankingsResponse.StudentRanking r = unsorted.get(i);
            ranked.add(new RankingsResponse.StudentRanking(i + 1, r.studentId(), r.studentName(), r.scores(), r.total(), r.average(), r.overallGrade()));
        }

        return new RankingsResponse(subjects, ranked);
    }

    private static final String[] IMPORT_HEADERS = {
            "Student First Name", "Student Last Name", "Student Date of Birth",
            "Subject Name", "Class Level", "Term", "Academic Year", "Score", "Remarks"
    };

    public byte[] generateTemplate() {
        return ExcelUtil.buildTemplate("Results", IMPORT_HEADERS,
                new String[]{"Jane", "Doe", "2016-04-12", "Mathematics", "Primary 3", "FIRST", "2024/2025", "85", "Excellent work"});
    }

    @Transactional
    public ImportResult importFromExcel(MultipartFile file, ImportMode mode, User teacher) throws IOException {
        List<Map<String, String>> rows = ExcelUtil.readRows(file);
        int created = 0, updated = 0, skipped = 0;
        List<ImportRowError> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            int rowNum = i + 2;
            Map<String, String> row = rows.get(i);
            try {
                String firstName = required(row, "Student First Name");
                String lastName = required(row, "Student Last Name");
                LocalDate dob = ExcelUtil.parseDate(required(row, "Student Date of Birth"));
                String subjectName = required(row, "Subject Name");
                String classLevel = required(row, "Class Level");
                Term term = Term.valueOf(required(row, "Term").trim().toUpperCase());
                String academicYear = required(row, "Academic Year");
                double score = Double.parseDouble(required(row, "Score"));
                String remarks = row.getOrDefault("Remarks", "");

                Student student = studentRepository
                        .findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndDateOfBirth(firstName, lastName, dob)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No student found matching " + firstName + " " + lastName + " (DOB " + dob + ")"));

                Subject subject = subjectRepository
                        .findByNameIgnoreCaseAndClassLevelIgnoreCase(subjectName, classLevel)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No subject found matching " + subjectName + " / " + classLevel));

                if (teacher.getRole() == Role.TEACHER &&
                        !schoolClassRepository.existsByTeachersIdAndName(teacher.getId(), student.getClassName())) {
                    throw new IllegalArgumentException("You are not assigned to " + student.getClassName());
                }

                Optional<Result> existing = resultRepository.findByStudentIdAndSubjectIdAndTermAndAcademicYear(
                        student.getId(), subject.getId(), term, academicYear);

                if (existing.isPresent()) {
                    if (mode == ImportMode.SKIP_DUPLICATES) {
                        skipped++;
                        continue;
                    }
                    Result result = existing.get();
                    result.setScore(score);
                    result.setRemarks(remarks);
                    result.setTeacher(teacher);
                    resultRepository.save(result);
                    updated++;
                } else {
                    Result result = Result.builder()
                            .student(student)
                            .subject(subject)
                            .teacher(teacher)
                            .term(term)
                            .academicYear(academicYear)
                            .score(score)
                            .remarks(remarks)
                            .build();
                    resultRepository.save(result);
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

    private ResultResponse toResponse(Result result) {
        String studentName = result.getStudent().getFirstName() + " " + result.getStudent().getLastName();
        String teacherName = result.getTeacher().getName();
        return new ResultResponse(
                result.getId(),
                studentName,
                result.getSubject().getName(),
                result.getTerm(),
                result.getAcademicYear(),
                result.getScore(),
                result.getGrade(),
                result.getRemarks(),
                teacherName
        );
    }
}
