package com.chatapp.mini_chat.controller;

import com.chatapp.mini_chat.model.Message;
import com.chatapp.mini_chat.repository.MessageRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    private final MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    //  Get all messages for a chatId (either private or group)
    @GetMapping("/{chatId}")
    public List<Message> getMessagesByChatId(@PathVariable String chatId) {
        System.out.println(">>> [MessageController] Fetching messages for chatId: " + chatId);
        return messageRepository.findByChatIdOrderByTimestampAsc(chatId);
    }

    //  Get the latest message for a private chat (for sidebar preview)
    @GetMapping("/{chatId}/last")
    public ResponseEntity<Message> getLastPrivateMessage(@PathVariable String chatId) {
        System.out.println(">>> [MessageController] Fetching last message for chatId: " + chatId);
        Message msg = messageRepository.findTopByChatIdOrderByTimestampDesc(chatId);
        if (msg == null) {
            System.out.println("⚠️ No messages found for chatId: " + chatId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(msg);
    }

    //  Get the latest message for a group (for sidebar preview)
    @GetMapping("/group/{groupId}/last")
    public ResponseEntity<Message> getLastGroupMessage(@PathVariable Long groupId) {
        System.out.println(">>> [MessageController] Fetching last message for groupId: " + groupId);
        Message msg = messageRepository.findTopByGroupIdOrderByTimestampDesc(groupId);
        if (msg == null) {
            System.out.println("⚠️ No messages found for groupId: " + groupId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(msg);
    }
}
