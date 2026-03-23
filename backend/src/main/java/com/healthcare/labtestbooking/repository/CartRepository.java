package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Cart;
import com.healthcare.labtestbooking.entity.Cart.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Find active cart by user ID
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId AND c.status = 'ACTIVE'")
    Optional<Cart> findActiveCartByUserId(@Param("userId") Long userId);

    // Find cart by user ID (any status)
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Cart> findByUserId(@Param("userId") Long userId);

    // Find by cart ID and user ID
    @Query("SELECT c FROM Cart c WHERE c.cartId = :cartId AND c.user.id = :userId")
    Optional<Cart> findByCartIdAndUserId(@Param("cartId") Long cartId, @Param("userId") Long userId);

    // Find expired carts
    @Query("SELECT c FROM Cart c WHERE c.status = 'ACTIVE' AND c.expiryAt < :now")
    List<Cart> findExpiredCarts(@Param("now") LocalDateTime now);

    // Find abandoned carts (not updated in X days)
    @Query("SELECT c FROM Cart c WHERE c.status = 'ACTIVE' AND c.updatedAt < :cutoffDate")
    List<Cart> findAbandonedCarts(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Count active carts with items
    @Query("SELECT COUNT(c) FROM Cart c WHERE c.status = 'ACTIVE' AND c.itemCount > 0")
    long countActiveCartsWithItems();

    // Mark expired carts
    @Modifying
    @Query("UPDATE Cart c SET c.status = 'EXPIRED' WHERE c.status = 'ACTIVE' AND c.expiryAt < :now")
    int markExpiredCarts(@Param("now") LocalDateTime now);

    // Mark abandoned carts
    @Modifying
    @Query("UPDATE Cart c SET c.status = 'ABANDONED' WHERE c.status = 'ACTIVE' AND c.updatedAt < :cutoffDate")
    int markAbandonedCarts(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Delete old carts
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.status IN ('EXPIRED', 'ABANDONED', 'CHECKED_OUT') AND c.updatedAt < :cutoffDate")
    int deleteOldCarts(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Find carts by status
    List<Cart> findByStatus(CartStatus status);

    // Check if user has active cart
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cart c WHERE c.user.id = :userId AND c.status = 'ACTIVE'")
    boolean hasActiveCart(@Param("userId") Long userId);
}
