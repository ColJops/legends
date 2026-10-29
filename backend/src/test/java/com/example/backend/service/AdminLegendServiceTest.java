package com.example.backend.service;

import com.example.backend.entity.AdminAuditAction;
import com.example.backend.entity.AdminAuditTargetType;
import com.example.backend.entity.Legend;
import com.example.backend.exception.LegendNotFoundException;
import com.example.backend.repository.LegendRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminLegendServiceTest {

    @Mock
    private LegendRepository legendRepository;

    @Mock
    private LegendService legendService;

    @Mock
    private AdminAuditService adminAuditService;

    @InjectMocks
    private AdminLegendService adminLegendService;

    @Test
    void deleteDelegatesToLegendServiceAndRecordsAuditLog() {
        UUID id = UUID.randomUUID();
        Legend legend = Legend.builder().id(id).title("Toruńskie Pierniki").build();
        when(legendRepository.findById(id)).thenReturn(Optional.of(legend));

        adminLegendService.delete(id);

        verify(legendService).delete(id);
        verify(adminAuditService).record(
                AdminAuditAction.LEGEND_DELETED,
                AdminAuditTargetType.LEGEND,
                id,
                "Toruńskie Pierniki",
                "Legenda została usunięta przez administratora"
        );
    }

    @Test
    void deleteThrowsWhenLegendDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(legendRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminLegendService.delete(id))
                .isInstanceOf(LegendNotFoundException.class);
    }
}
