package com.chatapp.mini_chat.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "chat_rooms")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String chatId;

    private String name; // for group chats
    private boolean isGroup;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> participants; // list of usernames

    public ChatRoom() {
        this.chatId = UUID.randomUUID().toString();
    }

    public ChatRoom(String name, boolean isGroup, List<String> participants) {
        this.chatId = UUID.randomUUID().toString();
        this.name = name;
        this.isGroup = isGroup;
        this.participants = participants;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getChatId() { return chatId; }
    public String getName() { return name; }
    public boolean isGroup() { return isGroup; }
    public List<String> getParticipants() { return participants; }

    public void setId(Long id) { this.id = id; }
    public void setChatId(String chatId) { this.chatId = chatId; }
    public void setName(String name) { this.name = name; }
    public void setGroup(boolean group) { isGroup = group; }
    public void setParticipants(List<String> participants) { this.participants = participants; }
}
