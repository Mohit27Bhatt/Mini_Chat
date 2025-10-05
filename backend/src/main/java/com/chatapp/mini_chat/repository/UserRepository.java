package com.chatapp.mini_chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.chatapp.mini_chat.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Add this method for searching users by partial name match
    List<User> findByUsernameContainingIgnoreCase(String username);
}
