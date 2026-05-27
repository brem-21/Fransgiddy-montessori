package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.result.ResultRequest;
import com.fransgiddy.montessori.dto.result.ResultResponse;
import com.fransgiddy.montessori.entity.Result;
import com.fransgiddy.montessori.entity.Student;
import com.fransgiddy.montessori.entity.Subject;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Term;
import com.fransgiddy.montessori.repository.ResultRepository;
import com.fransgiddy.montessori.repository.StudentRepository;
import com.fransgiddy.montessori.repository.SubjectRepository;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ResultResponse enterResult(ResultRequest request, String teacherEmail) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.studentId()));

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + request.subjectId()));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + teacherEmail));

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

    public List<ResultResponse> getStudentReportCard(Long studentId, String termStr, String academicYear) {
        Term term = Term.valueOf(termStr.toUpperCase());
        return resultRepository.findByStudentIdAndTermAndAcademicYear(studentId, term, academicYear).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ResultResponse> getTeacherResults(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + teacherEmail));

        return resultRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
