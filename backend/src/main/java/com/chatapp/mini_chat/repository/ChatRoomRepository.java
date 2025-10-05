package com.chatapp.mini_chat.repository;

import com.chatapp.mini_chat.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByChatId(String chatId);
    List<ChatRoom> findByParticipantsContaining(String username);
}
