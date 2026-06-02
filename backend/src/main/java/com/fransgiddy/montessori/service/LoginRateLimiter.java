package com.fransgiddy.montessori.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_MS = 15 * 60 * 1000L; // 15 minutes

    private final ConcurrentHashMap<String, AtomicInteger> attempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lockoutUntil = new ConcurrentHashMap<>();

    public void checkRateLimit(String phone) {
        Long lockedUntil = lockoutUntil.get(phone);
        if (lockedUntil != null) {
            if (System.currentTimeMillis() < lockedUntil) {
                long minutesLeft = (lockedUntil - System.currentTimeMillis()) / 60000 + 1;
                throw new RuntimeException(
                        "Too many failed attempts. Account locked for " + minutesLeft + " minute(s).");
            }
            lockoutUntil.remove(phone);
            attempts.remove(phone);
        }
    }

    public void recordFailure(String phone) {
        AtomicInteger count = attempts.computeIfAbsent(phone, k -> new AtomicInteger(0));
        if (count.incrementAndGet() >= MAX_ATTEMPTS) {
            lockoutUntil.put(phone, System.currentTimeMillis() + LOCKOUT_MS);
        }
    }

    public void recordSuccess(String phone) {
        attempts.remove(phone);
        lockoutUntil.remove(phone);
    }
}
