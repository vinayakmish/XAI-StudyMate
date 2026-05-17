package com.xaistudymate.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xaistudymate.backend.dto.chat.ChatRequestDTO;
import com.xaistudymate.backend.dto.chat.ChatResponseDTO;
import com.xaistudymate.backend.entity.ChatMessage;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Manages chat interactions: forwards to AI service and persists history.
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final AIServiceClient aiClient;
    private final ChatMessageRepository chatRepository;
    private final ObjectMapper objectMapper;

    public ChatService(AIServiceClient aiClient,
                       ChatMessageRepository chatRepository,
                       ObjectMapper objectMapper) {
        this.aiClient = aiClient;
        this.chatRepository = chatRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public ChatResponseDTO chat(User user, ChatRequestDTO request) {
        Map<String, Object> result = aiClient.chat(
                request.getMessage(), request.getStudentContext());

        String aiResponse = (String) result.get("response");
        List<String> suggestions = (List<String>) result.get("suggestions");

        // Persist to database
        ChatMessage message = ChatMessage.builder()
                .user(user)
                .userMessage(request.getMessage())
                .aiResponse(aiResponse)
                .suggestionsJson(toJson(suggestions))
                .build();
        chatRepository.save(message);

        return ChatResponseDTO.builder()
                .response(aiResponse)
                .suggestions(suggestions)
                .build();
    }

    public List<ChatMessage> getChatHistory(Long userId) {
        return chatRepository.findTop50ByUserIdOrderByCreatedAtAsc(userId);
    }

    private String toJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize to JSON: {}", e.getMessage());
            return null;
        }
    }
}
