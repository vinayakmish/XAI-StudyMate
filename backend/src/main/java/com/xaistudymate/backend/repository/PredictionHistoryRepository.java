package com.xaistudymate.backend.repository;

import com.xaistudymate.backend.entity.PredictionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {

    Page<PredictionHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<PredictionHistory> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<PredictionHistory> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);
}
