package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.service.CartService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Cart Controller Tests")
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    @Test
    @DisplayName("Should get user cart")
    @WithMockUser(roles = "USER")
    void testGetCart() throws Exception {
        // Arrange
        Map<String, Object> cart = new HashMap<>();
        cart.put("cartId", 1L);
        cart.put("itemCount", 3);
        cart.put("totalPrice", 2500.0);

        when(cartService.getCart(any())).thenReturn(cart);

        // Act & Assert
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.itemCount").value(3))
                .andExpect(jsonPath("$.data.totalPrice").value(2500.0));
    }

    @Test
    @DisplayName("Should add test to cart")
    @WithMockUser(roles = "USER")
    void testAddToCart() throws Exception {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("testId", 1L);
        request.put("quantity", 1);

        Map<String, Object> response = new HashMap<>();
        response.put("cartId", 1L);
        response.put("itemCount", 1);
        response.put("totalPrice", 500.0);

        when(cartService.addItem(any(), any(), any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.itemCount").value(1));
    }

    @Test
    @DisplayName("Should remove item from cart")
    @WithMockUser(roles = "USER")
    void testRemoveFromCart() throws Exception {
        // Arrange
        Map<String, Object> response = new HashMap<>();
        response.put("cartId", 1L);
        response.put("itemCount", 2);
        response.put("totalPrice", 1500.0);

        when(cartService.removeItem(any(), any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(delete("/api/cart/items/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.itemCount").value(2));
    }

    @Test
    @DisplayName("Should clear entire cart")
    @WithMockUser(roles = "USER")
    void testClearCart() throws Exception {
        // Arrange
        Map<String, Object> response = new HashMap<>();
        response.put("cartId", 1L);
        response.put("itemCount", 0);
        response.put("totalPrice", 0.0);

        when(cartService.clearCart(any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(delete("/api/cart/clear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.itemCount").value(0));
    }

    @Test
    @DisplayName("Should update cart item quantity")
    @WithMockUser(roles = "USER")
    void testUpdateQuantity() throws Exception {
        // Arrange
        Map<String, Object> request = new HashMap<>();
        request.put("itemId", 1L);
        request.put("quantity", 2);

        Map<String, Object> response = new HashMap<>();
        response.put("cartId", 1L);
        response.put("itemCount", 2);
        response.put("totalPrice", 1000.0);

        when(cartService.updateItemQuantity(any(), any(), any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/cart/items/1/quantity")
                .contentType(MediaType.APPLICATION_JSON)
                .param("quantity", "2"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle empty cart")
    @WithMockUser(roles = "USER")
    void testEmptyCart() throws Exception {
        // Arrange
        Map<String, Object> emptyCart = new HashMap<>();
        emptyCart.put("cartId", 1L);
        emptyCart.put("itemCount", 0);
        emptyCart.put("items", java.util.Collections.emptyList());

        when(cartService.getCart(any())).thenReturn(emptyCart);

        // Act & Assert
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.itemCount").value(0));
    }
}
