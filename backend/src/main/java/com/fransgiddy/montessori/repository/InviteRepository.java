package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.Invite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InviteRepository extends JpaRepository<Invite, Long> {

    Optional<Invite> findByToken(String token);

    Optional<Invite> findByEmail(String email);
}
