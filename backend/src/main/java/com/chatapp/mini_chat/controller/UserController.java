package com.chatapp.mini_chat.controller;

import com.chatapp.mini_chat.model.User;
import com.chatapp.mini_chat.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        System.out.println(">>> [UserController] GET /api/users called");
        List<User> users = userRepository.findAll();
        System.out.println(">>> [UserController] Returning " + users.size() + " users");
        return users;
    }

    // Search users
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String query) {
        System.out.println(">>> [UserController] GET /api/users/search?query=" + query);
        List<User> result = userRepository.findByUsernameContainingIgnoreCase(query);
        System.out.println(">>> [UserController] Found " + result.size() + " matching users");
        return result;
    }
}
