package com.chatapp.mini_chat.controller;

import com.chatapp.mini_chat.model.Message;
import com.chatapp.mini_chat.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import com.chatapp.mini_chat.repository.GroupRepository;
import com.chatapp.mini_chat.model.Group;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final GroupRepository groupRepository;

    @Autowired
    public ChatController(SimpMessagingTemplate messagingTemplate, 
                         MessageService messageService, 
                         GroupRepository groupRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.groupRepository = groupRepository;
    }

    @MessageMapping("/chat/{chatId}")
    @SendTo("/topic/chat/{chatId}")
    public Message sendMessage(@DestinationVariable String chatId, Message message) {
        System.out.println(">>> PRIVATE MESSAGE RECEIVED <<<");
        System.out.println("Chat ID: " + chatId);
        System.out.println("Sender: " + message.getSender());
        System.out.println("Content: " + message.getContent());

        message.setId(null);
        message.setChatId(chatId);
        message.setTimestamp(LocalDateTime.now());

        Message saved = messageService.saveMessage(message);
        return saved;
    }

    @MessageMapping("/group/{groupId}")
    public void sendGroupMessage(@DestinationVariable String groupId, 
                                 Message message, 
                                 Principal principal) {
        
        System.out.println(">>> GROUP MESSAGE RECEIVED <<<");
        System.out.println("Group ID: " + groupId);
        System.out.println("Sender: " + message.getSender());
        System.out.println("Principal: " + (principal != null ? principal.getName() : "NULL"));
        
        // Force NEW message to avoid optimistic locking
        message.setId(null);
        message.setChatId("group_" + groupId);
        message.setTimestamp(LocalDateTime.now());
        
        // Save ONCE
        Message saved = messageService.saveMessage(message);
        System.out.println("💾 Saved message with ID: " + saved.getId());

        // Get group from DB
        Group group = groupRepository.findById(Long.parseLong(groupId)).orElse(null);
        if (group == null) {
            System.out.println("⚠️ Group not found for ID: " + groupId);
            return;
        }

        // Send to each member individually
        for (String member : group.getMembers()) {
            System.out.println("📤 Sending to user: " + member);
            messagingTemplate.convertAndSendToUser(
                member,
                "/queue/group/" + groupId,
                saved
            );
        }
        
        System.out.println(" Group message sent to " + group.getMembers().size() + " members");
    }
}