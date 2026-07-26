package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByActiveTrue();

    List<Student> findByClassName(String className);

    List<Student> findByClassNameAndActiveTrue(String className);

    List<Student> findByClassNameInAndActiveTrue(Collection<String> classNames);

    long countByClassName(String className);

    Optional<Student> findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndDateOfBirth(
            String firstName, String lastName, LocalDate dateOfBirth);
}
