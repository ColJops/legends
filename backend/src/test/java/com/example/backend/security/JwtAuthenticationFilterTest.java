package com.example.backend.security;

import com.example.backend.service.CustomUserDetailsService;
import com.example.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void skipsAuthenticationWhenAuthorizationHeaderIsMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void authenticatesValidAndUsableUser() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();

        UserDetails userDetails = User.withUsername("ania")
                .password("pass")
                .roles("USER")
                .build();

        when(jwtService.extractUsername("valid-jwt")).thenReturn("ania");
        when(userDetailsService.loadUserByUsername("ania")).thenReturn(userDetails);
        when(jwtService.isTokenValid("valid-jwt", "ania")).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getName()).isEqualTo("ania");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doesNotAuthenticateLockedUser() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();

        UserDetails lockedUser = User.withUsername("locked")
                .password("pass")
                .roles("USER")
                .accountLocked(true)
                .build();

        when(jwtService.extractUsername("valid-jwt")).thenReturn("locked");
        when(userDetailsService.loadUserByUsername("locked")).thenReturn(lockedUser);
        when(jwtService.isTokenValid("valid-jwt", "locked")).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void clearsContextAndContinuesWhenTokenParsingThrowsException() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer malformed-jwt");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.extractUsername("malformed-jwt"))
                .thenThrow(new RuntimeException("Malformed JWT"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}
