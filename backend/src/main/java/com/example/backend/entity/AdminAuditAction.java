package com.example.backend.entity;

public enum AdminAuditAction {
    LEGEND_UPDATED,
    LEGEND_DELETED,

    USER_ROLE_CHANGED,
    USER_LOCKED,
    USER_UNLOCKED,
    USER_DELETED,

    MEDIA_FILE_DELETED,
    MEDIA_ORPHANS_CLEANED
}