package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.sms.*;
import com.fransgiddy.montessori.entity.SmsRequest;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.enums.Role;
import com.fransgiddy.montessori.enums.SmsRequestStatus;
import com.fransgiddy.montessori.repository.SmsRequestRepository;
import com.fransgiddy.montessori.repository.StudentRepository;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private static final String MNOTIFY_URL = "https://api.mnotify.com/api/sms/quick";
    private static final int BATCH_SIZE = 50;

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final SmsRequestRepository smsRequestRepository;
    private final SchoolSettingsService settingsService;
    private final RestTemplate restTemplate;

    // ── Direct send (principal only) ──────────────────────────────────────────

    public SmsBroadcastResponse send(SmsBroadcastRequest req) {
        List<String> phones = resolvePhones(req);
        if (phones.isEmpty()) {
            return new SmsBroadcastResponse(0, 0, "No recipients found.");
        }
        return dispatch(phones, req.message());
    }

    // ── Contacts list ─────────────────────────────────────────────────────────

    public List<SmsContactResponse> getContacts() {
        List<SmsContactResponse> contacts = new ArrayList<>();
        AtomicLong syntheticId = new AtomicLong(1);

        studentRepository.findByActiveTrue().stream()
                .filter(s -> s.getParentPhone() != null && !s.getParentPhone().isBlank())
                .forEach(s -> contacts.add(new SmsContactResponse(
                        syntheticId.getAndIncrement(),
                        s.getParentName() != null ? s.getParentName()
                                : s.getFirstName() + " " + s.getLastName() + "'s Parent",
                        s.getParentPhone(),
                        "PARENT"
                )));

        userRepository.findByRoleAndActiveTrue(Role.TEACHER).stream()
                .filter(u -> u.getPhone() != null && !u.getPhone().isBlank())
                .forEach(u -> contacts.add(new SmsContactResponse(
                        syntheticId.getAndIncrement(),
                        u.getName(),
                        u.getPhone(),
                        "TEACHER"
                )));

        return contacts;
    }

    // ── Recipient counts ──────────────────────────────────────────────────────

    public int countRecipients(SmsBroadcastRequest.RecipientType type) {
        return resolvePhonesByType(type).size();
    }

    // ── Teacher SMS requests ───────────────────────────────────────────────────

    public SmsRequestResponse createRequest(SmsBroadcastRequest req, User teacher) {
        SmsRequest saved = smsRequestRepository.save(SmsRequest.builder()
                .message(req.message())
                .recipientType(req.recipientType())
                .customPhones(req.customPhones() == null ? new ArrayList<>() : req.customPhones())
                .status(SmsRequestStatus.PENDING)
                .requestedBy(teacher)
                .build());
        return toResponse(saved);
    }

    public List<SmsRequestResponse> getPendingRequests() {
        return smsRequestRepository.findByStatusOrderByCreatedAtDesc(SmsRequestStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<SmsRequestResponse> getMyRequests(Long teacherId) {
        return smsRequestRepository.findByRequestedByIdOrderByCreatedAtDesc(teacherId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SmsBroadcastResponse approveRequest(Long id, User principal) {
        SmsRequest req = smsRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        if (req.getStatus() != SmsRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not pending");
        }
        SmsBroadcastResponse result = send(new SmsBroadcastRequest(
                req.getMessage(), req.getRecipientType(), req.getCustomPhones()));
        req.setStatus(SmsRequestStatus.APPROVED);
        req.setReviewedBy(principal);
        req.setReviewedAt(LocalDateTime.now());
        smsRequestRepository.save(req);
        return result;
    }

    public void rejectRequest(Long id, User principal) {
        SmsRequest req = smsRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        if (req.getStatus() != SmsRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not pending");
        }
        req.setStatus(SmsRequestStatus.REJECTED);
        req.setReviewedBy(principal);
        req.setReviewedAt(LocalDateTime.now());
        smsRequestRepository.save(req);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private SmsBroadcastResponse dispatch(List<String> phones, String message) {
        String apiKey = settingsService.get("mnotify.api.key");
        String sender = settingsService.getOrDefault("mnotify.sender.id", "FransgiddyRS");

        if (apiKey == null || apiKey.isBlank()) {
            return new SmsBroadcastResponse(0, phones.size(),
                    "mNotify API key is not configured. Go to Settings and add it.");
        }

        String url = MNOTIFY_URL + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        int sent = 0;
        int failed = 0;

        for (List<String> batch : partition(phones, BATCH_SIZE)) {
            try {
                Map<String, Object> body = new HashMap<>();
                body.put("recipient", batch);
                body.put("sender", sender);
                body.put("message", message);
                body.put("is_schedule", false);
                body.put("schedule_date", "");

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                log.info("mNotify response for batch of {}: {}", batch.size(), response.getBody());

                if (response.getStatusCode().is2xxSuccessful()
                        && response.getBody() != null
                        && response.getBody().contains("\"status\":\"success\"")) {
                    sent += batch.size();
                } else {
                    log.warn("mNotify returned non-success for batch: {}", response.getBody());
                    failed += batch.size();
                }
            } catch (Exception e) {
                log.error("Failed to send SMS batch via mNotify: {}", e.getMessage());
                failed += batch.size();
            }
        }

        return new SmsBroadcastResponse(sent, failed,
                "Sent to " + sent + " recipient(s)" + (failed > 0 ? ", " + failed + " failed" : "."));
    }

    private List<String> resolvePhones(SmsBroadcastRequest req) {
        if (req.recipientType() == SmsBroadcastRequest.RecipientType.CUSTOM) {
            return req.customPhones() == null ? List.of() :
                    req.customPhones().stream()
                            .map(this::normalizePhone)
                            .filter(p -> !p.isBlank())
                            .distinct()
                            .collect(Collectors.toList());
        }
        return resolvePhonesByType(req.recipientType());
    }

    private List<String> resolvePhonesByType(SmsBroadcastRequest.RecipientType type) {
        List<String> phones = new ArrayList<>();

        if (type == SmsBroadcastRequest.RecipientType.PARENTS
                || type == SmsBroadcastRequest.RecipientType.ALL) {
            studentRepository.findByActiveTrue().stream()
                    .map(s -> s.getParentPhone())
                    .filter(p -> p != null && !p.isBlank())
                    .map(this::normalizePhone)
                    .forEach(phones::add);
        }

        if (type == SmsBroadcastRequest.RecipientType.TEACHERS
                || type == SmsBroadcastRequest.RecipientType.ALL) {
            userRepository.findByRoleAndActiveTrue(Role.TEACHER).stream()
                    .map(u -> u.getPhone())
                    .filter(p -> p != null && !p.isBlank())
                    .map(this::normalizePhone)
                    .forEach(phones::add);
        }

        return phones.stream().distinct().collect(Collectors.toList());
    }

    // mNotify expects local format: 0XXXXXXXXX
    private String normalizePhone(String phone) {
        String p = phone.trim().replaceAll("[\\s\\-()]", "");
        if (p.startsWith("+233")) p = "0" + p.substring(4);
        if (p.startsWith("233") && p.length() == 12) p = "0" + p.substring(3);
        return p;
    }

    private <T> List<List<T>> partition(List<T> list, int size) {
        List<List<T>> parts = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            parts.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return parts;
    }

    private SmsRequestResponse toResponse(SmsRequest r) {
        return new SmsRequestResponse(
                r.getId(),
                r.getMessage(),
                r.getRecipientType(),
                r.getCustomPhones(),
                r.getStatus(),
                r.getRequestedBy().getName(),
                r.getReviewedBy() != null ? r.getReviewedBy().getName() : null,
                r.getCreatedAt(),
                r.getReviewedAt()
        );
    }
}
