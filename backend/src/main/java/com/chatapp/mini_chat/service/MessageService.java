package com.chatapp.mini_chat.service;

import com.chatapp.mini_chat.model.Message;
import com.chatapp.mini_chat.repository.MessageRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {
    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getMessagesByChatId(String chatId) {
        return messageRepository.findByChatIdOrderByTimestampAsc(chatId);
    }
}


