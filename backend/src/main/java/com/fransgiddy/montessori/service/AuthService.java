package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.auth.*;
import com.fransgiddy.montessori.entity.Invite;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.InviteStatus;
import com.fransgiddy.montessori.repository.InviteRepository;
import com.fransgiddy.montessori.repository.UserRepository;
import com.fransgiddy.montessori.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final InviteRepository inviteRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.phone(), request.password())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user);

        return new LoginResponse(token, user.getName(), user.getPhone(), user.getRole().name());
    }

    @Transactional
    public String inviteUser(InviteRequest request, User currentUser) {
        if (userRepository.existsByPhone(request.phone())) {
            throw new RuntimeException("A user with this phone number already exists.");
        }

        inviteRepository.findByPhone(request.phone()).ifPresent(existing -> {
            if (existing.getStatus() == InviteStatus.PENDING && existing.getExpiresAt().isAfter(LocalDateTime.now())) {
                throw new RuntimeException("An active invite already exists for this phone number.");
            }
            inviteRepository.delete(existing);
        });

        String token = UUID.randomUUID().toString();
        String inviteLink = frontendUrl + "/accept-invite?token=" + token;

        Invite invite = Invite.builder()
                .phone(request.phone())
                .role(request.role())
                .token(token)
                .status(InviteStatus.PENDING)
                .invitedBy(currentUser)
                .expiresAt(LocalDateTime.now().plusHours(48))
                .build();

        inviteRepository.save(invite);
        return inviteLink;
    }

    @Transactional
    public void completeRegistration(CompleteRegistrationRequest request) {
        Invite invite = inviteRepository.findByToken(request.token())
                .orElseThrow(() -> new RuntimeException("Invalid or non-existent invite token."));

        if (invite.getStatus() == InviteStatus.ACCEPTED) {
            throw new RuntimeException("This invite has already been used.");
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
            throw new RuntimeException("This invite has expired.");
        }

        User user = User.builder()
                .name(request.name())
                .phone(invite.getPhone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(invite.getRole())
                .active(true)
                .build();

        userRepository.save(user);

        invite.setStatus(InviteStatus.ACCEPTED);
        inviteRepository.save(invite);
    }

    public Map<String, Object> getCurrentUser(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found."));

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "phone", user.getPhone(),
                "role", user.getRole().name(),
                "active", user.isActive()
        );
    }

}
