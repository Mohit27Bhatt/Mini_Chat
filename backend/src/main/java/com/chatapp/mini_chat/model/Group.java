package com.chatapp.mini_chat.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "chat_groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> members; // store usernames of members

    public Group() {}

    public Group(String name, List<String> members) {
        this.name = name;
        this.members = members;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public List<String> getMembers() { return members; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setMembers(List<String> members) { this.members = members; }
}
