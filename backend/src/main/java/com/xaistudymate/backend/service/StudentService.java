package com.xaistudymate.backend.service;

import com.xaistudymate.backend.dto.student.StudentInputDTO;
import com.xaistudymate.backend.entity.StudentProfile;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.exception.ResourceNotFoundException;
import com.xaistudymate.backend.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages student profile CRUD operations.
 */
@Service
public class StudentService {

    private final StudentProfileRepository profileRepository;

    public StudentService(StudentProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public StudentProfile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "StudentProfile", "userId", userId));
    }

    public StudentInputDTO getProfileDTO(Long userId) {
        StudentProfile p = getProfileByUserId(userId);
        return toDTO(p);
    }

    public boolean hasProfile(Long userId) {
        return profileRepository.existsByUserId(userId);
    }

    @Transactional
    public StudentProfile saveOrUpdate(User user, StudentInputDTO dto) {
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(StudentProfile.builder().user(user).build());

        profile.setGender(dto.getGender());
        profile.setAge(dto.getAge());
        profile.setDegree(dto.getDegree());
        profile.setBranch(dto.getBranch());
        profile.setCgpa(dto.getCgpa());
        profile.setBacklogs(dto.getBacklogs());
        profile.setInternships(dto.getInternships());
        profile.setCertifications(dto.getCertifications());
        profile.setCodingSkills(dto.getCodingSkills());
        profile.setCommunicationSkills(dto.getCommunicationSkills());
        profile.setAptitudeScore(dto.getAptitudeScore());
        profile.setProjects(dto.getProjects());

        return profileRepository.save(profile);
    }

    public StudentInputDTO toDTO(StudentProfile p) {
        return StudentInputDTO.builder()
                .gender(p.getGender())
                .age(p.getAge())
                .degree(p.getDegree())
                .branch(p.getBranch())
                .cgpa(p.getCgpa())
                .backlogs(p.getBacklogs())
                .internships(p.getInternships())
                .certifications(p.getCertifications())
                .codingSkills(p.getCodingSkills())
                .communicationSkills(p.getCommunicationSkills())
                .aptitudeScore(p.getAptitudeScore())
                .projects(p.getProjects())
                .build();
    }
}
