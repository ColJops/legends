package com.example.backend.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.mail.mode", havingValue = "smtp")
public class SmtpPasswordResetEmailSender implements PasswordResetEmailSender {

    private final JavaMailSender mailSender;
    private final String from;

    public SmtpPasswordResetEmailSender(
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
    public void sendPasswordResetEmail(
            String recipient,
            String username,
            String resetLink
    ) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("Legends – reset hasła");
        message.setText("""
                Witaj %s,

                aby ustawić nowe hasło do konta Legends, otwórz poniższy link:

                %s

                Link jest jednorazowy i wygaśnie po upływie określonego czasu.
                Jeżeli to nie Ty poprosiłeś o reset hasła, zignoruj tę wiadomość.
                """.formatted(username, resetLink));
        mailSender.send(message);
    }
}
