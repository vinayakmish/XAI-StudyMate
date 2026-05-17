package com.xaistudymate.backend.dto.chat;

import com.xaistudymate.backend.dto.student.StudentInputDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDTO {

    @NotBlank(message = "Message is required")
    private String message;

    /** Optional student context for personalized responses. */
    private StudentInputDTO studentContext;
}
