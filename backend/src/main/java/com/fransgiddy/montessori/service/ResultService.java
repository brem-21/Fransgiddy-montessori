package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.result.RankingsResponse;
import com.fransgiddy.montessori.dto.result.ReportCardResponse;
import com.fransgiddy.montessori.dto.result.ResultRequest;
import com.fransgiddy.montessori.dto.result.ResultResponse;
import com.fransgiddy.montessori.entity.Result;
import com.fransgiddy.montessori.entity.Student;
import com.fransgiddy.montessori.entity.Subject;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Term;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.repository.ResultRepository;
import com.fransgiddy.montessori.repository.SchoolClassRepository;
import com.fransgiddy.montessori.repository.StudentRepository;
import com.fransgiddy.montessori.repository.SubjectRepository;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        return new ReportCardResponse(
                student.getFirstName() + " " + student.getLastName(),
                student.getClassName(),
                termStr,
                academicYear,
                entries,
                total,
                average,
                overallGrade
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
