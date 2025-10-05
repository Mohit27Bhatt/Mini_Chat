package com.chatapp.mini_chat.repository;

import com.chatapp.mini_chat.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByMembersContaining(String username);
}
