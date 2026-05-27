package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findAllByOrderByCreatedAtAsc();

    List<Registration> findByStatus(String status);
}
