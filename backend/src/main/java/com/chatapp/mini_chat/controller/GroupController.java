package com.chatapp.mini_chat.controller;

import com.chatapp.mini_chat.model.Group;
import com.chatapp.mini_chat.repository.GroupRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {

    private final GroupRepository groupRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public GroupController(GroupRepository groupRepository, 
                          SimpMessagingTemplate messagingTemplate) {
        this.groupRepository = groupRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
public Group createGroup(@RequestBody Group group) {
    System.out.println("=== CREATE GROUP REQUEST ===");
    System.out.println("Group Name: " + group.getName());
    System.out.println("Members: " + group.getMembers());
    
    if (group.getName() == null || group.getMembers() == null) {
        throw new IllegalArgumentException("Group name and members are required");
    }
    
    // Get creator from JWT token or request
    String creator = SecurityContextHolder.getContext().getAuthentication().getName();
    
    // Add creator to members if not already included
    if (creator != null && !group.getMembers().contains(creator)) {
        group.getMembers().add(creator);
    }
    
    Group saved = groupRepository.save(group);
    System.out.println(" Group saved with ID: " + saved.getId());
    
    // Notify all members
    for (String member : saved.getMembers()) {
        System.out.println("📤 Notifying member: " + member);
        try {
            messagingTemplate.convertAndSendToUser(
                member,
                "/queue/group-created",
                saved
            );
            System.out.println(" Notification sent to: " + member);
        } catch (Exception e) {
            System.err.println("❌ Failed to notify " + member + ": " + e.getMessage());
        }
    }
    
    return saved;
}

    @GetMapping("/{username}")
    public List<Group> getGroupsForUser(@PathVariable String username) {
        return groupRepository.findByMembersContaining(username);
    }

    @GetMapping
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }
}