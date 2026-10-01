package com.example.backend.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.mail.mode", havingValue = "smtp")
public class SmtpVerificationEmailSender
        implements VerificationEmailSender {

    private final JavaMailSender mailSender;
    private final String from;

    public SmtpVerificationEmailSender(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String from,
            @Value("${spring.mail.host}") String host
    ) {
        if (from == null || from.isBlank()) {
            throw new IllegalStateException(
                    "app.mail.from must be configured in SMTP mode"
            );
        }
        if (host == null || host.isBlank()) {
            throw new IllegalStateException(
                    "spring.mail.host must be configured in SMTP mode"
            );
        }

        this.mailSender = mailSender;
        this.from = from;
    }

    @Override
    public void sendVerificationEmail(
            String recipient,
            String username,
            String verificationLink
    ) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("Legends – potwierdź adres e-mail");
        message.setText("""
                Witaj %s,

                aby aktywować konto w aplikacji Legends, otwórz poniższy link:

                %s

                Link jest jednorazowy i ma ograniczony czas ważności.
                Jeżeli to nie Ty zakładałeś konto, zignoruj tę wiadomość.
                """.formatted(username, verificationLink));

        mailSender.send(message);
    }
}
