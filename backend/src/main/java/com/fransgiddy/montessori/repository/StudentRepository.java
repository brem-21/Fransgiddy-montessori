package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByActiveTrue();

    List<Student> findByClassName(String className);

    long countByClassName(String className);
}
