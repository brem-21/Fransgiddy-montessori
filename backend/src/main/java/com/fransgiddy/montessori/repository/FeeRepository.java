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

    List<Fee> findByCollectedByEmail(String email);

    List<Fee> findByCollectedByEmailAndFeeDateBetween(String email, LocalDate start, LocalDate end);

    List<Fee> findByFeeDateBetween(LocalDate start, LocalDate end);

    List<Fee> findByStudentIdAndFeeDateBetween(Long studentId, LocalDate start, LocalDate end);

    List<Fee> findByCollectedByIdAndFeeDateBetween(Long teacherId, LocalDate start, LocalDate end);

    List<Fee> findByCollectedByEmailAndStudentId(String email, Long studentId);

    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.collectedBy.email = :email AND f.feeDate BETWEEN :start AND :end")
    BigDecimal sumByCollectorAndDateRange(@Param("email") String email, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.feeDate BETWEEN :start AND :end")
    BigDecimal sumByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
