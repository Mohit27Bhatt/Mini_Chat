package com.chatapp.mini_chat.repository;

import com.chatapp.mini_chat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Existing method
    List<Message> findByChatIdOrderByTimestampAsc(String chatId);

    //  NEW: Get latest message in a private chat
    Message findTopByChatIdOrderByTimestampDesc(String chatId);

    //  NEW: Get latest message in a group
    Message findTopByGroupIdOrderByTimestampDesc(Long groupId);
}
