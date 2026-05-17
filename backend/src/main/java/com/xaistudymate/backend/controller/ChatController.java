package com.xaistudymate.backend.controller;

import com.xaistudymate.backend.dto.chat.ChatRequestDTO;
import com.xaistudymate.backend.dto.chat.ChatResponseDTO;
import com.xaistudymate.backend.entity.ChatMessage;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.service.AuthService;
import com.xaistudymate.backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;

    public ChatController(ChatService chatService, AuthService authService) {
        this.chatService = chatService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ChatResponseDTO> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatRequestDTO request) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        ChatResponseDTO response = chatService.chat(user, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getChatHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        List<ChatMessage> messages = chatService.getChatHistory(user.getId());

        List<Map<String, Object>> history = messages.stream()
                .map(msg -> Map.<String, Object>of(
                        "id", msg.getId(),
                        "userMessage", msg.getUserMessage(),
                        "aiResponse", msg.getAiResponse(),
                        "suggestions", msg.getSuggestionsJson() != null ? msg.getSuggestionsJson() : "[]",
                        "createdAt", msg.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }
}
