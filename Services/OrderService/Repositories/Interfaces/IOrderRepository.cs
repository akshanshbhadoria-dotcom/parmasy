using OrderService.Entities;

namespace OrderService.Repositories.Interfaces;

public interface IOrderRepository
{
    Task<Order> CreateAsync(Order order);

    Task<List<Order>> GetAllAsync();

    Task<List<Order>> GetByUserIdAsync(Guid userId);

    Task<Order?> GetByIdAsync(Guid id);

    void ReplaceItems(Order order, List<OrderItem> items);

    void Delete(Order order);

    Task SaveChangesAsync();
}