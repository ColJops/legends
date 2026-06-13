package com.example.backend.upload;

import com.example.backend.exception.InvalidFileException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileUploadServiceTest {

    @TempDir
    Path uploadDirectory;

    private final FileUploadService fileUploadService = new FileUploadService();

    @Test
    void storesValidPngUsingGeneratedSafeFilename() throws Exception {
        ReflectionTestUtils.setField(fileUploadService, "uploadDir", uploadDirectory.toString());
        byte[] png = {
                (byte) 0x89, 0x50, 0x4E, 0x47,
                0x0D, 0x0A, 0x1A, 0x0A
        };
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../unsafe-name.png",
                "image/png",
                png
        );

        String imageUrl = fileUploadService.uploadLegendImage(file);

        assertThat(imageUrl)
                .startsWith("/uploads/legends/")
                .endsWith(".png")
                .doesNotContain("unsafe-name");
        Path storedFile = uploadDirectory.resolve(imageUrl.substring(imageUrl.lastIndexOf('/') + 1));
        assertThat(storedFile).exists();
        assertThat(Files.readAllBytes(storedFile)).containsExactly(png);
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.png",
                "image/png",
                new byte[0]
        );

        assertThatThrownBy(() -> fileUploadService.uploadLegendImage(file))
                .isInstanceOf(InvalidFileException.class)
                .hasMessage("Plik jest pusty.");
    }

    @Test
    void rejectsUnsupportedContentType() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.txt",
                "text/plain",
                "not an image".getBytes()
        );

        assertThatThrownBy(() -> fileUploadService.uploadLegendImage(file))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("Dozwolone");
    }

    @Test
    void rejectsFileWhoseBytesDoNotMatchDeclaredType() {
        byte[] jpegHeader = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "fake.png",
                "image/png",
                jpegHeader
        );

        assertThatThrownBy(() -> fileUploadService.uploadLegendImage(file))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("uszkodzony plik graficzny");
    }
}
