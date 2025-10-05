package com.chatapp.mini_chat.controller;

import com.chatapp.mini_chat.model.Message;
import com.chatapp.mini_chat.repository.MessageRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-chats")
@CrossOrigin(origins = "http://localhost:5173")
public class UserChatController {

    private final MessageRepository messageRepository;

    public UserChatController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping("/{username}")
    public Set<String> getUserChats(@PathVariable String username) {
        List<Message> messages = messageRepository.findAll();

        // Extract all chatIds where this user is involved
        return messages.stream()
                .map(Message::getChatId)
                .filter(id -> id.contains(username))
                .collect(Collectors.toSet());
    }
}
