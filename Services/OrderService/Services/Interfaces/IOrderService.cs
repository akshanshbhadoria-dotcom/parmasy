using OrderService.DTOs.Requests;
using OrderService.DTOs.Responses;

namespace OrderService.Services.Interfaces;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(Guid userId, CreateOrderRequest request);

    Task<List<OrderResponse>> GetAllOrdersAsync();

    Task<List<OrderResponse>> GetOrderHistoryAsync(Guid userId);

    Task<OrderResponse?> GetOrderByIdAsync(Guid id);

    Task<OrderResponse> UpdateOrderAsync(Guid id, UpdateOrderRequest request);

    Task DeleteOrderAsync(Guid id);

    Task<OrderResponse> VerifyOrderAsync(Guid id);
}