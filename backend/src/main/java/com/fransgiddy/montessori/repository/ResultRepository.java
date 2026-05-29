package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.Result;
import com.fransgiddy.montessori.enums.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT r FROM Result r WHERE r.student.className = :className AND r.term = :term AND r.academicYear = :academicYear")
    List<Result> findByClassNameAndTermAndAcademicYear(
        @Param("className") String className,
        @Param("term") Term term,
        @Param("academicYear") String academicYear
    );

    @Query("SELECT r FROM Result r WHERE r.student.className = :className")
    List<Result> findByStudentClassName(@Param("className") String className);
}
