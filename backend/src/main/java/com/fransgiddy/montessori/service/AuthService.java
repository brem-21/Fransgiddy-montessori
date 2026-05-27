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
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateToken(user);

        return new LoginResponse(token, user.getName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public void inviteUser(InviteRequest request, User currentUser) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("A user with this email already exists.");
        }

        inviteRepository.findByEmail(request.email()).ifPresent(existing -> {
            if (existing.getStatus() == InviteStatus.PENDING && existing.getExpiresAt().isAfter(LocalDateTime.now())) {
                throw new RuntimeException("An active invite already exists for this email.");
            }
            inviteRepository.delete(existing);
        });

        String token = UUID.randomUUID().toString();

        Invite invite = Invite.builder()
                .email(request.email())
                .role(request.role())
                .token(token)
                .status(InviteStatus.PENDING)
                .invitedBy(currentUser)
                .expiresAt(LocalDateTime.now().plusHours(48))
                .build();

        inviteRepository.save(invite);

        sendInviteEmail(request.email(), request.name(), token);
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

        if (userRepository.existsByEmail(invite.getEmail())) {
            throw new RuntimeException("A user with this email already exists.");
        }

        User user = User.builder()
                .name(request.name())
                .email(invite.getEmail())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(invite.getRole())
                .active(true)
                .build();

        userRepository.save(user);

        invite.setStatus(InviteStatus.ACCEPTED);
        inviteRepository.save(invite);
    }

    public Map<String, Object> getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "active", user.isActive()
        );
    }

    private void sendInviteEmail(String toEmail, String name, String token) {
        try {
            String inviteLink = frontendUrl + "/accept-invite?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("You have been invited to Fransgiddy Montessori");
            message.setText(
                    "Hello " + name + ",\n\n" +
                    "You have been invited to join the Fransgiddy Montessori School Management System.\n\n" +
                    "Please click the link below to complete your registration:\n" +
                    inviteLink + "\n\n" +
                    "This link will expire in 48 hours.\n\n" +
                    "If you did not expect this invitation, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Fransgiddy Montessori Team"
            );

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send invite email: " + e.getMessage());
        }
    }
}
