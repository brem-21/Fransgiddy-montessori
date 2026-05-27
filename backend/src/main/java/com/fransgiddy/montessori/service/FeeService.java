package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.fee.*;
import com.fransgiddy.montessori.entity.Fee;
import com.fransgiddy.montessori.entity.Student;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.repository.FeeRepository;
import com.fransgiddy.montessori.repository.SchoolClassRepository;
import com.fransgiddy.montessori.repository.StudentRepository;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;

    public FeeResponse enterFee(FeeRequest request, User currentUser) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + request.studentId()));

        User collector;
        if (currentUser.getRole() == Role.PRINCIPAL && request.collectedById() != null) {
            collector = userRepository.findById(request.collectedById())
                    .orElseThrow(() -> new RuntimeException("Collector not found with ID: " + request.collectedById()));
        } else {
            collector = currentUser;
        }

        if (collector.getRole() == Role.TEACHER &&
                !schoolClassRepository.existsByTeachersIdAndName(collector.getId(), student.getClassName())) {
            throw new RuntimeException("You are not assigned to this student's class.");
        }

        Fee fee = new Fee();
        fee.setStudent(student);
        fee.setCollectedBy(collector);
        fee.setAmount(request.amount());
        fee.setDescription(request.description());
        fee.setFeeDate(request.feeDate() != null ? request.feeDate() : LocalDate.now());

        Fee saved = feeRepository.save(fee);
        return toResponse(saved);
    }

    public List<FeeResponse> getMyFees(String phone) {
        return feeRepository.findByCollectedByPhone(phone)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TeacherAnalyticsResponse getTeacherAnalytics(String phone, LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : YearMonth.now().atDay(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Fee> fees = feeRepository.findByCollectedByPhoneAndFeeDateBetween(phone, start, end);

        BigDecimal totalAmount = fees.stream()
                .map(Fee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long feeCount = fees.size();

        LocalDate today = LocalDate.now();
        List<Fee> todayFees = fees.stream()
                .filter(f -> f.getFeeDate().equals(today))
                .collect(Collectors.toList());
        BigDecimal todayAmount = todayFees.stream()
                .map(Fee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long todayCount = todayFees.size();

        // Top students by total amount, descending, top 10
        Map<Long, List<Fee>> byStudent = fees.stream()
                .collect(Collectors.groupingBy(f -> f.getStudent().getId()));

        List<TeacherAnalyticsResponse.StudentSummary> topStudents = byStudent.entrySet().stream()
                .map(entry -> {
                    List<Fee> studentFees = entry.getValue();
                    Fee first = studentFees.get(0);
                    BigDecimal studentTotal = studentFees.stream()
                            .map(Fee::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    String studentName = first.getStudent().getFirstName() + " " + first.getStudent().getLastName();
                    String className = first.getStudent().getClassName();
                    return new TeacherAnalyticsResponse.StudentSummary(
                            entry.getKey(), studentName, className, studentTotal, studentFees.size());
                })
                .sorted(Comparator.comparing(TeacherAnalyticsResponse.StudentSummary::totalAmount).reversed())
                .limit(10)
                .collect(Collectors.toList());

        // Daily trend: group by feeDate, sorted by date ascending
        Map<LocalDate, List<Fee>> byDate = fees.stream()
                .collect(Collectors.groupingBy(Fee::getFeeDate));

        List<TeacherAnalyticsResponse.DailyEntry> dailyTrend = byDate.entrySet().stream()
                .map(entry -> {
                    BigDecimal dayTotal = entry.getValue().stream()
                            .map(Fee::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new TeacherAnalyticsResponse.DailyEntry(entry.getKey(), dayTotal, entry.getValue().size());
                })
                .sorted(Comparator.comparing(TeacherAnalyticsResponse.DailyEntry::date))
                .collect(Collectors.toList());

        // Recent entries: last 20 by createdAt desc
        List<FeeResponse> recentEntries = fees.stream()
                .filter(f -> f.getCreatedAt() != null)
                .sorted(Comparator.comparing(Fee::getCreatedAt).reversed())
                .limit(20)
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new TeacherAnalyticsResponse(
                totalAmount, feeCount, todayAmount, todayCount, topStudents, dailyTrend, recentEntries);
    }

    public PrincipalAnalyticsResponse getPrincipalAnalytics(LocalDate startDate, LocalDate endDate,
                                                             Long teacherId, Long studentId, String className) {
        LocalDate start = startDate != null ? startDate : YearMonth.now().atDay(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Fee> fees = feeRepository.findByFeeDateBetween(start, end);

        // Filter in-memory by teacherId and/or studentId if provided
        if (teacherId != null) {
            fees = fees.stream()
                    .filter(f -> f.getCollectedBy().getId().equals(teacherId))
                    .collect(Collectors.toList());
        }
        if (studentId != null) {
            fees = fees.stream()
                    .filter(f -> f.getStudent().getId().equals(studentId))
                    .collect(Collectors.toList());
        }
        if (className != null && !className.isBlank()) {
            fees = fees.stream()
                    .filter(f -> className.equals(f.getStudent().getClassName()))
                    .collect(Collectors.toList());
        }

        BigDecimal totalAmount = fees.stream()
                .map(Fee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long feeCount = fees.size();

        LocalDate today = LocalDate.now();
        List<Fee> todayFees = fees.stream()
                .filter(f -> f.getFeeDate().equals(today))
                .collect(Collectors.toList());
        BigDecimal todayAmount = todayFees.stream()
                .map(Fee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long todayCount = todayFees.size();

        // By teacher summary
        Map<Long, List<Fee>> byTeacherMap = fees.stream()
                .collect(Collectors.groupingBy(f -> f.getCollectedBy().getId()));

        List<PrincipalAnalyticsResponse.TeacherSummary> byTeacher = byTeacherMap.entrySet().stream()
                .map(entry -> {
                    List<Fee> teacherFees = entry.getValue();
                    Fee first = teacherFees.get(0);
                    BigDecimal teacherTotal = teacherFees.stream()
                            .map(Fee::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    String teacherName = first.getCollectedBy().getName();
                    return new PrincipalAnalyticsResponse.TeacherSummary(
                            entry.getKey(), teacherName, teacherTotal, teacherFees.size());
                })
                .sorted(Comparator.comparing(PrincipalAnalyticsResponse.TeacherSummary::totalAmount).reversed())
                .collect(Collectors.toList());

        // Top students by total amount, descending, top 10
        Map<Long, List<Fee>> byStudentMap = fees.stream()
                .collect(Collectors.groupingBy(f -> f.getStudent().getId()));

        List<PrincipalAnalyticsResponse.StudentSummary> topStudents = byStudentMap.entrySet().stream()
                .map(entry -> {
                    List<Fee> studentFees = entry.getValue();
                    Fee first = studentFees.get(0);
                    BigDecimal studentTotal = studentFees.stream()
                            .map(Fee::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    String studentName = first.getStudent().getFirstName() + " " + first.getStudent().getLastName();
                    String studentClass = first.getStudent().getClassName();
                    return new PrincipalAnalyticsResponse.StudentSummary(
                            entry.getKey(), studentName, studentClass, studentTotal, studentFees.size());
                })
                .sorted(Comparator.comparing(PrincipalAnalyticsResponse.StudentSummary::totalAmount).reversed())
                .limit(10)
                .collect(Collectors.toList());

        // Daily trend: group by feeDate, sorted by date ascending
        Map<LocalDate, List<Fee>> byDate = fees.stream()
                .collect(Collectors.groupingBy(Fee::getFeeDate));

        List<PrincipalAnalyticsResponse.DailyEntry> dailyTrend = byDate.entrySet().stream()
                .map(entry -> {
                    BigDecimal dayTotal = entry.getValue().stream()
                            .map(Fee::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new PrincipalAnalyticsResponse.DailyEntry(entry.getKey(), dayTotal, entry.getValue().size());
                })
                .sorted(Comparator.comparing(PrincipalAnalyticsResponse.DailyEntry::date))
                .collect(Collectors.toList());

        // Recent entries: last 20 by createdAt desc
        List<FeeResponse> recentEntries = fees.stream()
                .filter(f -> f.getCreatedAt() != null)
                .sorted(Comparator.comparing(Fee::getCreatedAt).reversed())
                .limit(20)
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PrincipalAnalyticsResponse(
                totalAmount, feeCount, todayAmount, todayCount, byTeacher, topStudents, dailyTrend, recentEntries);
    }

    public List<FeeResponse> getAllFees(LocalDate startDate, LocalDate endDate,
                                        Long teacherId, Long studentId, String className) {
        LocalDate start = startDate != null ? startDate : LocalDate.of(2000, 1, 1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Fee> fees = feeRepository.findByFeeDateBetween(start, end);

        if (teacherId != null) {
            fees = fees.stream()
                    .filter(f -> f.getCollectedBy().getId().equals(teacherId))
                    .collect(Collectors.toList());
        }
        if (studentId != null) {
            fees = fees.stream()
                    .filter(f -> f.getStudent().getId().equals(studentId))
                    .collect(Collectors.toList());
        }
        if (className != null && !className.isBlank()) {
            fees = fees.stream()
                    .filter(f -> className.equals(f.getStudent().getClassName()))
                    .collect(Collectors.toList());
        }

        return fees.stream()
                .sorted(Comparator.comparing(Fee::getFeeDate).reversed())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FeeResponse> getFeesByStudent(Long studentId) {
        return feeRepository.findAll().stream()
                .filter(f -> f.getStudent().getId().equals(studentId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private FeeResponse toResponse(Fee fee) {
        return new FeeResponse(
                fee.getId(),
                fee.getStudent().getFirstName() + " " + fee.getStudent().getLastName(),
                fee.getStudent().getClassName(),
                fee.getCollectedBy().getName(),
                fee.getAmount(),
                fee.getDescription(),
                fee.getFeeDate(),
                fee.getCreatedAt()
        );
    }
}
