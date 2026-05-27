package com.fransgiddy.montessori.config;

import com.fransgiddy.montessori.entity.*;
import com.fransgiddy.montessori.entity.SchoolClass;
import com.fransgiddy.montessori.enums.*;
import com.fransgiddy.montessori.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ResultRepository resultRepository;
    private final AnnouncementRepository announcementRepository;
    private final RegistrationRepository registrationRepository;
    private final FeeRepository feeRepository;
    private final SchoolClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.principal.password:Principal@2024}")
    private String principalPassword;

    @Value("${app.principal.name:School Principal}")
    private String principalName;

    @Override
    public void run(ApplicationArguments args) {
        seedClassesIfEmpty();
        if (userRepository.count() > 0) return; // already seeded

        // ── Principal ──────────────────────────────────────────────────────────
        User principal = new User();
        principal.setName(principalName);
        principal.setPasswordHash(passwordEncoder.encode(principalPassword));
        principal.setRole(Role.PRINCIPAL);
        principal.setActive(true);
        principal.setPhone("0302000001");
        userRepository.save(principal);
        System.out.println("=== Principal account created: phone=0302000001 ===");

        // ── Teachers ───────────────────────────────────────────────────────────
        User teacher1 = createTeacher("Abena Asante", "0244100001", "Teacher@2024");
        User teacher2 = createTeacher("Kofi Mensah", "0244100002", "Teacher@2024");
        User teacher3 = createTeacher("Akosua Boateng", "0244100003", "Teacher@2024");
        userRepository.saveAll(List.of(teacher1, teacher2, teacher3));

        // ── Subjects ───────────────────────────────────────────────────────────
        List<Subject> subjects = subjectRepository.saveAll(List.of(
            subject("Mathematics",    "Grade 1"), subject("English Language", "Grade 1"),
            subject("Science",        "Grade 1"), subject("Social Studies",   "Grade 1"),
            subject("Mathematics",    "Grade 2"), subject("English Language", "Grade 2"),
            subject("Science",        "Grade 2"), subject("Creative Arts",    "Grade 2"),
            subject("Mathematics",    "Grade 3"), subject("English Language", "Grade 3"),
            subject("Science",        "Grade 3"), subject("French",           "Grade 3"),
            subject("Numeracy",       "Nursery"), subject("Literacy",         "Nursery"),
            subject("Phonics",        "Nursery")
        ));

        // ── Students ───────────────────────────────────────────────────────────
        List<Student> students = studentRepository.saveAll(List.of(
            student("Ama",     "Boateng",   "Grade 1", "2017-03-15", "Kwame Boateng",   "0244123401"),
            student("Kweku",   "Asante",    "Grade 1", "2017-06-22", "Yaa Asante",      "0244123402"),
            student("Efua",    "Mensah",    "Grade 1", "2017-01-10", "Kojo Mensah",     "0244123403"),
            student("Nana",    "Darko",     "Grade 2", "2016-09-05", "Adwoa Darko",     "0244123404"),
            student("Kofi",    "Amponsah",  "Grade 2", "2016-11-18", "Ama Amponsah",    "0244123405"),
            student("Abena",   "Owusu",     "Grade 2", "2016-04-30", "Yaw Owusu",       "0244123406"),
            student("Akua",    "Frimpong",  "Grade 3", "2015-07-14", "Kwesi Frimpong",  "0244123407"),
            student("Yaw",     "Antwi",     "Grade 3", "2015-02-28", "Akosua Antwi",    "0244123408"),
            student("Adwoa",   "Tetteh",    "Grade 3", "2015-12-03", "Kofi Tetteh",     "0244123409"),
            student("Kwame",   "Sarfo",     "Nursery", "2020-05-20", "Esi Sarfo",       "0244123410"),
            student("Esi",     "Quaye",     "Nursery", "2020-08-11", "Fiifi Quaye",     "0244123411"),
            student("Fiifi",   "Opoku",     "Grade 1", "2017-10-07", "Nana Opoku",      "0244123412")
        ));

        // ── Results (Term 1, 2025/2026) ─────────────────────────────────────────
        Subject math1 = subjects.get(0), eng1 = subjects.get(1), sci1 = subjects.get(2), soc1 = subjects.get(3);
        Subject math2 = subjects.get(4), eng2 = subjects.get(5), sci2 = subjects.get(6), art2 = subjects.get(7);
        Subject math3 = subjects.get(8), eng3 = subjects.get(9), sci3 = subjects.get(10), fr3 = subjects.get(11);

        Student ama = students.get(0), kweku = students.get(1), efua = students.get(2);
        Student nana = students.get(3), kofiS = students.get(4), abena = students.get(5);
        Student akua = students.get(6), yaw = students.get(7), adwoa = students.get(8);

        resultRepository.saveAll(List.of(
            result(ama,   math1, teacher1, Term.FIRST, 88.0, "Excellent"),
            result(ama,   eng1,  teacher1, Term.FIRST, 82.0, "Very good"),
            result(ama,   sci1,  teacher2, Term.FIRST, 90.0, "Outstanding"),
            result(ama,   soc1,  teacher2, Term.FIRST, 76.0, "Good"),
            result(kweku, math1, teacher1, Term.FIRST, 72.0, "Good effort"),
            result(kweku, eng1,  teacher1, Term.FIRST, 68.0, "Needs improvement"),
            result(kweku, sci1,  teacher2, Term.FIRST, 75.0, "Satisfactory"),
            result(kweku, soc1,  teacher2, Term.FIRST, 80.0, "Good"),
            result(efua,  math1, teacher1, Term.FIRST, 95.0, "Exceptional"),
            result(efua,  eng1,  teacher1, Term.FIRST, 91.0, "Excellent"),
            result(efua,  sci1,  teacher2, Term.FIRST, 89.0, "Very good"),
            result(efua,  soc1,  teacher2, Term.FIRST, 93.0, "Excellent"),
            result(nana,  math2, teacher2, Term.FIRST, 65.0, "Average"),
            result(nana,  eng2,  teacher2, Term.FIRST, 70.0, "Good"),
            result(nana,  sci2,  teacher3, Term.FIRST, 62.0, "Needs improvement"),
            result(nana,  art2,  teacher3, Term.FIRST, 85.0, "Very creative"),
            result(kofiS, math2, teacher2, Term.FIRST, 78.0, "Good"),
            result(kofiS, eng2,  teacher2, Term.FIRST, 74.0, "Good effort"),
            result(kofiS, sci2,  teacher3, Term.FIRST, 81.0, "Very good"),
            result(kofiS, art2,  teacher3, Term.FIRST, 88.0, "Excellent"),
            result(abena, math2, teacher2, Term.FIRST, 55.0, "Needs support"),
            result(abena, eng2,  teacher2, Term.FIRST, 60.0, "Improving"),
            result(akua,  math3, teacher3, Term.FIRST, 92.0, "Outstanding"),
            result(akua,  eng3,  teacher3, Term.FIRST, 87.0, "Excellent"),
            result(akua,  sci3,  teacher1, Term.FIRST, 94.0, "Top performer"),
            result(akua,  fr3,   teacher1, Term.FIRST, 79.0, "Good"),
            result(yaw,   math3, teacher3, Term.FIRST, 83.0, "Very good"),
            result(yaw,   eng3,  teacher3, Term.FIRST, 77.0, "Good"),
            result(adwoa, math3, teacher3, Term.FIRST, 71.0, "Satisfactory"),
            result(adwoa, eng3,  teacher3, Term.FIRST, 69.0, "Needs improvement")
        ));

        // ── Announcements ──────────────────────────────────────────────────────
        announcementRepository.saveAll(List.of(
            announcement("Term 1 Results Out",
                "We are pleased to announce that Term 1 results for the 2025/2026 academic year are now available. Parents can visit the school office to collect report cards.",
                AnnouncementType.NEWS, principal, true),
            announcement("School Sports Day – June 14",
                "Our annual Sports Day will be held on Saturday, June 14, 2026. All students are expected to participate. Parents and guardians are warmly invited.",
                AnnouncementType.EVENT, principal, true),
            announcement("Fee Payment Reminder",
                "This is a reminder that Term 2 school fees are due by June 30, 2026. Please ensure timely payment to avoid disruption to your child's education.",
                AnnouncementType.ANNOUNCEMENT, principal, true),
            announcement("New Library Books Arrive",
                "We have received a new collection of over 200 books for our school library covering science, literature, and arts. Students are encouraged to borrow and read.",
                AnnouncementType.NEWS, principal, true),
            announcement("Parent-Teacher Meeting – May 30",
                "A Parent-Teacher meeting is scheduled for May 30, 2026 from 9:00 AM to 1:00 PM. All parents are strongly encouraged to attend.",
                AnnouncementType.EVENT, principal, false)
        ));

        // ── Registrations ──────────────────────────────────────────────────────
        registrationRepository.saveAll(List.of(
            registration("Maame Brew",    "0201000001", "Akwasi",    "Brew",       "2019-04-12", "Nursery", "Interested in Montessori curriculum", "PENDING"),
            registration("Fati Alhassan", "0201000002", "Ibrahim",   "Alhassan",   "2018-09-03", "Grade 1", "Relocating from Kumasi, strong academic background", "REVIEWED"),
            registration("Rose Acheampong","0201000003","Priscilla", "Acheampong", "2017-12-21", "Grade 2", "Looking for a nurturing school environment", "ACCEPTED"),
            registration("Emmanuel Doku", "0201000004", "Joshua",    "Doku",       "2020-02-15", "Nursery", "Heard great things from neighbours", "PENDING"),
            registration("Vida Asare",    "0201000005", "Miriam",    "Asare",      "2016-07-08", "Grade 3", "Child has special interest in science and maths", "PENDING")
        ));

        // ── Fees ───────────────────────────────────────────────────────────────
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate twoDaysAgo = today.minusDays(2);
        LocalDate lastWeek = today.minusWeeks(1);

        feeRepository.saveAll(List.of(
            fee(students.get(0),  teacher1, new BigDecimal("450.00"), "Term 1 school fees",    today),
            fee(students.get(1),  teacher1, new BigDecimal("450.00"), "Term 1 school fees",    today),
            fee(students.get(2),  teacher1, new BigDecimal("450.00"), "Term 1 school fees",    yesterday),
            fee(students.get(3),  teacher2, new BigDecimal("500.00"), "Term 1 school fees",    today),
            fee(students.get(4),  teacher2, new BigDecimal("500.00"), "Term 1 school fees",    today),
            fee(students.get(5),  teacher2, new BigDecimal("500.00"), "Term 1 school fees",    yesterday),
            fee(students.get(6),  teacher3, new BigDecimal("550.00"), "Term 1 school fees",    today),
            fee(students.get(7),  teacher3, new BigDecimal("550.00"), "Term 1 school fees",    twoDaysAgo),
            fee(students.get(8),  teacher3, new BigDecimal("550.00"), "Term 1 school fees",    twoDaysAgo),
            fee(students.get(9),  principal, new BigDecimal("350.00"),"Term 1 school fees",    lastWeek),
            fee(students.get(10), principal, new BigDecimal("350.00"),"Term 1 school fees",    lastWeek),
            fee(students.get(0),  teacher1, new BigDecimal("50.00"),  "Activity fee",          yesterday),
            fee(students.get(3),  teacher2, new BigDecimal("50.00"),  "Activity fee",          yesterday),
            fee(students.get(6),  teacher3, new BigDecimal("75.00"),  "Sports Day contribution",today),
            fee(students.get(11), teacher1, new BigDecimal("450.00"), "Term 1 school fees",    lastWeek)
        ));

        // ── School Classes ─────────────────────────────────────────────────────
        SchoolClass nurseryClass = SchoolClass.builder()
                .name("Nursery")
                .description("Early childhood education, ages 3-4")
                .teachers(List.of(teacher3))
                .build();

        SchoolClass grade1Class = SchoolClass.builder()
                .name("Grade 1")
                .description("Primary level 1, ages 5-6")
                .teachers(List.of(teacher1))
                .build();

        SchoolClass grade2Class = SchoolClass.builder()
                .name("Grade 2")
                .description("Primary level 2, ages 6-7")
                .teachers(List.of(teacher2))
                .build();

        SchoolClass grade3Class = SchoolClass.builder()
                .name("Grade 3")
                .description("Primary level 3, ages 7-8")
                .teachers(List.of(teacher3))
                .build();

        classRepository.saveAll(List.of(nurseryClass, grade1Class, grade2Class, grade3Class));
        System.out.println("=== School classes seeded ===");

        System.out.println("=== Seed data loaded: teachers, students, subjects, results, announcements, registrations, fees ===");
    }

    private void seedClassesIfEmpty() {
        if (classRepository.count() > 0) return;
        List<User> teachers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.TEACHER)
                .collect(java.util.stream.Collectors.toList());

        List<String[]> classData = List.of(
                new String[]{"Nursery",  "Early childhood education, ages 3-4"},
                new String[]{"Grade 1",  "Primary level 1, ages 5-6"},
                new String[]{"Grade 2",  "Primary level 2, ages 6-7"},
                new String[]{"Grade 3",  "Primary level 3, ages 7-8"}
        );

        for (int i = 0; i < classData.size(); i++) {
            String[] d = classData.get(i);
            List<User> classTeachers = teachers.isEmpty() ? List.of()
                    : List.of(teachers.get(i % teachers.size()));
            SchoolClass sc = SchoolClass.builder()
                    .name(d[0]).description(d[1]).teachers(classTeachers).build();
            classRepository.save(sc);
        }
        System.out.println("=== School classes seeded ===");
    }

    private User createTeacher(String name, String phone, String password) {
        User t = new User();
        t.setName(name);
        t.setPhone(phone);
        t.setPasswordHash(passwordEncoder.encode(password));
        t.setRole(Role.TEACHER);
        t.setActive(true);
        return t;
    }

    private Subject subject(String name, String classLevel) {
        Subject s = new Subject();
        s.setName(name);
        s.setClassLevel(classLevel);
        return s;
    }

    private Student student(String first, String last, String className,
                             String dob, String parentName, String phone) {
        Student s = new Student();
        s.setFirstName(first);
        s.setLastName(last);
        s.setClassName(className);
        s.setDateOfBirth(LocalDate.parse(dob));
        s.setParentName(parentName);
        s.setParentPhone(phone);
        s.setEnrollmentDate(LocalDate.of(2024, 9, 1));
        s.setActive(true);
        return s;
    }

    private Result result(Student student, Subject subject, User teacher,
                           Term term, double score, String remarks) {
        Result r = new Result();
        r.setStudent(student);
        r.setSubject(subject);
        r.setTeacher(teacher);
        r.setTerm(term);
        r.setAcademicYear("2025/2026");
        r.setScore(score);
        r.setRemarks(remarks);
        return r;
    }

    private Announcement announcement(String title, String content,
                                       AnnouncementType type, User author, boolean published) {
        Announcement a = new Announcement();
        a.setTitle(title);
        a.setContent(content);
        a.setType(type);
        a.setAuthor(author);
        a.setPublished(published);
        return a;
    }

    private Registration registration(String parentName, String parentPhone,
                                       String childFirst, String childLast, String dob,
                                       String desiredClass, String message, String status) {
        Registration r = new Registration();
        r.setParentName(parentName);
        r.setParentPhone(parentPhone);
        r.setChildFirstName(childFirst);
        r.setChildLastName(childLast);
        r.setChildDateOfBirth(LocalDate.parse(dob));
        r.setDesiredClass(desiredClass);
        r.setMessage(message);
        r.setStatus(status);
        return r;
    }

    private Fee fee(Student student, User collector, BigDecimal amount,
                    String description, LocalDate feeDate) {
        Fee f = new Fee();
        f.setStudent(student);
        f.setCollectedBy(collector);
        f.setAmount(amount);
        f.setDescription(description);
        f.setFeeDate(feeDate);
        return f;
    }
}
