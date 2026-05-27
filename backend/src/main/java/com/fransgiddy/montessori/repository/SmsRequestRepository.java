package com.fransgiddy.montessori.repository;

import com.fransgiddy.montessori.entity.SmsRequest;
import com.fransgiddy.montessori.enums.SmsRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SmsRequestRepository extends JpaRepository<SmsRequest, Long> {
    List<SmsRequest> findByStatusOrderByCreatedAtDesc(SmsRequestStatus status);
    List<SmsRequest> findByRequestedByIdOrderByCreatedAtDesc(Long userId);
}
