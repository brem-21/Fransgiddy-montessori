package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    Optional<SchoolClass> findByName(String name);
    boolean existsByName(String name);
    List<SchoolClass> findByTeachersId(Long teacherId);
    boolean existsByTeachersIdAndName(Long teacherId, String name);
}
