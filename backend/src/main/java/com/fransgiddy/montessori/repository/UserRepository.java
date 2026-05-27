package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    List<User> findByRoleAndActiveTrue(Role role);
}
