package com.xaistudymate.backend.controller;

import com.xaistudymate.backend.dto.student.StudentInputDTO;
import com.xaistudymate.backend.entity.StudentProfile;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.service.AuthService;
import com.xaistudymate.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;
    private final AuthService authService;

    public StudentController(StudentService studentService, AuthService authService) {
        this.studentService = studentService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentInputDTO> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        StudentInputDTO dto = studentService.getProfileDTO(user.getId());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentInputDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StudentInputDTO dto) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        StudentProfile saved = studentService.saveOrUpdate(user, dto);
        return ResponseEntity.ok(studentService.toDTO(saved));
    }
}
