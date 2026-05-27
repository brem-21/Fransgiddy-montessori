package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.registration.RegistrationRequest;
import com.fransgiddy.montessori.entity.Registration;
import com.fransgiddy.montessori.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;

    @Transactional
    public Registration submit(RegistrationRequest request) {
        Registration registration = Registration.builder()
                .parentName(request.parentName())
                .parentEmail(request.parentEmail())
                .parentPhone(request.parentPhone())
                .childFirstName(request.childFirstName())
                .childLastName(request.childLastName())
                .childDateOfBirth(request.childDateOfBirth())
                .desiredClass(request.desiredClass())
                .message(request.message())
                .status("PENDING")
                .build();

        return registrationRepository.save(registration);
    }

    public List<Registration> getAll() {
        return registrationRepository.findAllByOrderByCreatedAtAsc();
    }

    @Transactional
    public Registration updateStatus(Long id, String status) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found with id: " + id));

        registration.setStatus(status.toUpperCase());
        return registrationRepository.save(registration);
    }
}
