package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {

    List<Fee> findByStudentId(Long studentId);

    List<Fee> findByCollectedByPhone(String phone);

    List<Fee> findByCollectedByPhoneAndFeeDateBetween(String phone, LocalDate start, LocalDate end);

    List<Fee> findByFeeDateBetween(LocalDate start, LocalDate end);

    List<Fee> findByStudentIdAndFeeDateBetween(Long studentId, LocalDate start, LocalDate end);

    List<Fee> findByCollectedByIdAndFeeDateBetween(Long teacherId, LocalDate start, LocalDate end);

    @Query("SELECT f FROM Fee f WHERE f.student.className = :className AND f.feeDate BETWEEN :start AND :end")
    List<Fee> findByStudentClassNameAndFeeDateBetween(
            @Param("className") String className,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.feeDate BETWEEN :start AND :end")
    BigDecimal sumByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
