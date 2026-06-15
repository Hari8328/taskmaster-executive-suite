package com.taskmaster.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String displayName;
    private String email;
    private String avatarUrl;
    private String bio;
    private String phoneNumber;
}
