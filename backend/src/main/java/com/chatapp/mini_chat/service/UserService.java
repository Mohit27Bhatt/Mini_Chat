package com.chatapp.mini_chat.service;

import com.chatapp.mini_chat.model.User;
import com.chatapp.mini_chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
   public UserService(UserRepository repo, @Lazy PasswordEncoder passwordEncoder){
        this.userRepository = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerNewUser(String username, String email, String rawPassword) {
        if (userRepository.existsByUsername(username))
            throw new IllegalArgumentException("username already exists");
        if (userRepository.existsByEmail(email))
            throw new IllegalArgumentException("email already in use");

        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setOnline(false);
        u.setLastSeen(LocalDateTime.now());
        return userRepository.save(u);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public void setOnline(String username, boolean online) {
        userRepository.findByUsername(username).ifPresent(u -> {
            u.setOnline(online);
            if (!online) u.setLastSeen(LocalDateTime.now());
            userRepository.save(u);
        });
    }

    public void updateLastSeen(String username) {
        userRepository.findByUsername(username).ifPresent(u -> {
            u.setOnline(false);
            u.setLastSeen(LocalDateTime.now());
            userRepository.save(u);
        });
    }

   @Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User u = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

    // If roles are null or empty, assign a default "USER" role
    String role = (u.getRoles() == null || u.getRoles().isBlank()) ? "ROLE_USER" : u.getRoles();

    return new org.springframework.security.core.userdetails.User(
            u.getUsername(),
            u.getPassword(),
            List.of(new SimpleGrantedAuthority(role))
    );
}

}
