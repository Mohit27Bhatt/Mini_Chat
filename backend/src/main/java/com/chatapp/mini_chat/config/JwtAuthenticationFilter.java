package com.chatapp.mini_chat.config;

import com.chatapp.mini_chat.service.UserService;
import com.chatapp.mini_chat.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, @Lazy UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        System.out.println("=== JWT Filter Processing ===");
        System.out.println("Path: " + path);

        // Skip JWT validation for public endpoints
        if (path.startsWith("/auth/") || path.startsWith("/h2-console/") || path.startsWith("/test/")) {
            System.out.println("Skipping JWT validation for public endpoint");
            filterChain.doFilter(request, response);
            return;
        }

        final String header = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + header);
        
        String username = null;
        String jwt = null;

        if (header != null && header.startsWith("Bearer ")) {
            jwt = header.substring(7);
            System.out.println("JWT Token found");
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("Username extracted: " + username);
            } catch (Exception e) {
                System.out.println("Error extracting username: " + e.getMessage());
            }
        } else {
            System.out.println("No Bearer token found");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("Loading user details for: " + username);
            try {
                UserDetails userDetails = userService.loadUserByUsername(username);
                
                if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                    System.out.println("JWT token validated successfully");
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("JWT token validation failed");
                }
            } catch (Exception e) {
                System.out.println("Error during authentication: " + e.getMessage());
            }
        }

        System.out.println("=== Calling next filter ===");
        filterChain.doFilter(request, response);
    }
}