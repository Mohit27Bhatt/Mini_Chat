package com.chatapp.mini_chat.controller;

import com.chatapp.mini_chat.dto.AuthResponse;
import com.chatapp.mini_chat.dto.LoginRequest;
import com.chatapp.mini_chat.dto.RegisterRequest;
import com.chatapp.mini_chat.model.User;
import com.chatapp.mini_chat.service.UserService;
import com.chatapp.mini_chat.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        System.out.println("=== AuthController initialized ===");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        System.out.println("\n========================================");
        System.out.println(">>> REGISTER ENDPOINT CALLED <<<");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Email: " + request.getEmail());
        System.out.println("========================================\n");
        
        try {
            User newUser = userService.registerNewUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword()
            );

            String token = jwtUtil.generateToken(newUser.getUsername());
            System.out.println("Registration successful for: " + newUser.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, newUser.getUsername(), newUser.getEmail()));
        } catch (Exception e) {
            System.out.println("Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("\n========================================");
        System.out.println(">>> LOGIN ENDPOINT CALLED <<<");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Password length: " + (request.getPassword() != null ? request.getPassword().length() : 0));
        System.out.println("========================================\n");
        
        try {
            System.out.println("Attempting authentication...");
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(), request.getPassword()
                    )
            );
            System.out.println("Authentication successful!");

            String token = jwtUtil.generateToken(request.getUsername());
            System.out.println("JWT token generated");
            
            User user = userService.findByUsername(request.getUsername()).orElseThrow();
            System.out.println("User found: " + user.getUsername());
            
            userService.setOnline(user.getUsername(), true);
            System.out.println("User set to online");

            System.out.println("Login successful for: " + user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail()));
        } catch (AuthenticationException e) {
            System.out.println("Authentication FAILED: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body("Invalid username or password");
        } catch (Exception e) {
            System.out.println("Login ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }
    
    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        System.out.println("\n>>> TEST ENDPOINT CALLED <<<\n");
        return ResponseEntity.ok("Auth controller is working!");
    }
}