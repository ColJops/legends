package com.example.backend.service;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void loadsUserDetailsWithCorrectFlagsAndRole() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .username("admin")
                .email("admin@example.com")
                .password("encoded-pass")
                .role(Role.ADMIN)
                .enabled(true)
                .locked(false)
                .build();
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        UserDetails details = customUserDetailsService.loadUserByUsername("admin");

        assertThat(details.getUsername()).isEqualTo("admin");
        assertThat(details.getPassword()).isEqualTo("encoded-pass");
        assertThat(details.isEnabled()).isTrue();
        assertThat(details.isAccountNonLocked()).isTrue();
        assertThat(details.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_ADMIN");
    }

    @Test
    void mapsDisabledAndLockedAccountFlags() {
        User user = User.builder()
                .username("lockeduser")
                .password("pass")
                .role(Role.USER)
                .enabled(false)
                .locked(true)
                .build();
        when(userRepository.findByUsername("lockeduser")).thenReturn(Optional.of(user));

        UserDetails details = customUserDetailsService.loadUserByUsername("lockeduser");

        assertThat(details.isEnabled()).isFalse();
        assertThat(details.isAccountNonLocked()).isFalse();
    }

    @Test
    void throwsUsernameNotFoundWhenUserMissing() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("ghost"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("ghost");
    }
}