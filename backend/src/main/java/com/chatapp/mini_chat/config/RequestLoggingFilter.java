package com.chatapp.mini_chat.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1) // Execute before security filters
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        System.out.println("\n╔════════════════════════════════════════════════════════════╗");
        System.out.println("║ INCOMING REQUEST");
        System.out.println("║ Method: " + httpRequest.getMethod());
        System.out.println("║ URI: " + httpRequest.getRequestURI());
        System.out.println("║ Path: " + httpRequest.getServletPath());
        System.out.println("║ Content-Type: " + httpRequest.getHeader("Content-Type"));
        System.out.println("╚════════════════════════════════════════════════════════════╝\n");
        
        chain.doFilter(request, response);
        
        System.out.println(">>> REQUEST COMPLETED <<<\n");
    }
}