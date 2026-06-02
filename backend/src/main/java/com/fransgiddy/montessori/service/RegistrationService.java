package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.registration.RegistrationRequest;
import com.fransgiddy.montessori.entity.Registration;
import com.fransgiddy.montessori.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
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
                .parentName(strip(request.parentName()))
                .parentPhone(strip(request.parentPhone()))
                .parentEmail(strip(request.parentEmail()))
                .childFirstName(strip(request.childFirstName()))
                .childLastName(strip(request.childLastName()))
                .childDateOfBirth(request.childDateOfBirth())
                .desiredClass(strip(request.desiredClass()))
                .message(strip(request.message()))
                .status("PENDING")
                .build();

        return registrationRepository.save(registration);
    }

    private static String strip(String input) {
        if (input == null) return null;
        return Jsoup.clean(input, Safelist.none());
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
