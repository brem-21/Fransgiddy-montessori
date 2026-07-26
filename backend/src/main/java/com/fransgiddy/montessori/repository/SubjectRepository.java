package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByClassLevel(String classLevel);

    Optional<Subject> findByNameIgnoreCaseAndClassLevelIgnoreCase(String name, String classLevel);
}
