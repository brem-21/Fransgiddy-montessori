package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.Result;
import com.fransgiddy.montessori.enums.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByStudentId(Long studentId);

    List<Result> findByStudentIdAndTermAndAcademicYear(Long studentId, Term term, String academicYear);

    List<Result> findByTeacherId(Long teacherId);

    Optional<Result> findByStudentIdAndSubjectIdAndTermAndAcademicYear(
            Long studentId, Long subjectId, Term term, String academicYear);
}
