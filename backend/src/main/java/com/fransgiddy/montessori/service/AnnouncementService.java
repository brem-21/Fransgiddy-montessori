package com.fransgiddy.montessori.service;

import com.fransgiddy.montessori.dto.announcement.AnnouncementRequest;
import com.fransgiddy.montessori.dto.announcement.AnnouncementResponse;
import com.fransgiddy.montessori.entity.Announcement;
import com.fransgiddy.montessori.entity.User;
import com.fransgiddy.montessori.repository.AnnouncementRepository;
import com.fransgiddy.montessori.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @Transactional
    public AnnouncementResponse create(AnnouncementRequest request, String authorPhone) {
        User author = userRepository.findByPhone(authorPhone)
                .orElseThrow(() -> new RuntimeException("Author not found with phone: " + authorPhone));

        Announcement announcement = Announcement.builder()
                .title(request.title())
                .content(request.content())
                .type(request.type())
                .author(author)
                .published(request.published())
                .build();

        announcement = announcementRepository.save(announcement);
        return toResponse(announcement);
    }

    @Transactional
    public AnnouncementResponse update(Long id, AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with id: " + id));

        announcement.setTitle(request.title());
        announcement.setContent(request.content());
        announcement.setType(request.type());
        announcement.setPublished(request.published());

        announcement = announcementRepository.save(announcement);
        return toResponse(announcement);
    }

    @Transactional
    public AnnouncementResponse publish(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with id: " + id));

        announcement.setPublished(true);
        announcement = announcementRepository.save(announcement);
        return toResponse(announcement);
    }

    public List<AnnouncementResponse> getPublished() {
        return announcementRepository.findByPublishedTrueOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AnnouncementResponse> getAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        if (!announcementRepository.existsById(id)) {
            throw new RuntimeException("Announcement not found with id: " + id);
        }
        announcementRepository.deleteById(id);
    }

    @Transactional
    public AnnouncementResponse addMedia(Long id, String mediaUrl) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        a.getMediaUrls().add(mediaUrl);
        return toResponse(announcementRepository.save(a));
    }

    private AnnouncementResponse toResponse(Announcement announcement) {
        return new AnnouncementResponse(
                announcement.getId(),
                announcement.getTitle(),
                announcement.getContent(),
                announcement.getType(),
                announcement.isPublished(),
                announcement.getAuthor().getName(),
                announcement.getCreatedAt(),
                announcement.getMediaUrls()
        );
    }
}
