package com.example.backend.controller;

import com.example.backend.dto.auth.MessageResponse;
import com.example.backend.dto.auth.ForgotPasswordRequest;
import com.example.backend.dto.auth.ResendVerificationRequest;
import com.example.backend.service.EmailVerificationService;
import com.example.backend.service.PasswordResetService;
import com.example.backend.service.UserService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class AuthControllerTest {

    @Test
    void resendReturnsSameAcceptedResponseForAnyEmail() {
        UserService userService = mock(UserService.class);
        EmailVerificationService verificationService =
                mock(EmailVerificationService.class);
        PasswordResetService passwordResetService =
                mock(PasswordResetService.class);
        AuthController controller = new AuthController(
                userService,
                verificationService,
                passwordResetService
        );

        var forExisting = controller.resendVerification(
                new ResendVerificationRequest("known@example.com")
        );
        var forMissing = controller.resendVerification(
                new ResendVerificationRequest("missing@example.com")
        );

        assertThat(forExisting.getStatusCode())
                .isEqualTo(forMissing.getStatusCode());
        assertThat(forExisting.getStatusCode().value()).isEqualTo(202);
        MessageResponse response = forExisting.getBody();
        assertThat(response).isEqualTo(forMissing.getBody());
        assertThat(response.message()).contains("Jeżeli konto istnieje");
        verify(verificationService).resend("known@example.com");
        verify(verificationService).resend("missing@example.com");
    }

    @Test
    void forgotPasswordReturnsSameAcceptedResponseForAnyEmail() {
        UserService userService = mock(UserService.class);
        EmailVerificationService verificationService =
                mock(EmailVerificationService.class);
        PasswordResetService passwordResetService =
                mock(PasswordResetService.class);
        AuthController controller = new AuthController(
                userService,
                verificationService,
                passwordResetService
        );

        var forExisting = controller.forgotPassword(
                new ForgotPasswordRequest("known@example.com")
        );
        var forMissing = controller.forgotPassword(
                new ForgotPasswordRequest("missing@example.com")
        );

        assertThat(forExisting.getStatusCode())
                .isEqualTo(forMissing.getStatusCode());
        assertThat(forExisting.getStatusCode().value()).isEqualTo(202);
        assertThat(forExisting.getBody()).isEqualTo(forMissing.getBody());
        assertThat(forExisting.getBody().message())
                .contains("Jeżeli konto istnieje");
        verify(passwordResetService).requestReset("known@example.com");
        verify(passwordResetService).requestReset("missing@example.com");
    }
}
