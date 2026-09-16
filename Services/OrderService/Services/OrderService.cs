using OrderService.DTOs.Requests;
using OrderService.DTOs.Responses;
using OrderService.Entities;
using OrderService.Integrations;
using OrderService.Repositories.Interfaces;
using OrderService.Services.Interfaces;

namespace OrderService.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IInventoryClient _inventoryClient;

    public OrderService(
        IOrderRepository orderRepository,
        IInventoryClient inventoryClient)
    {
        _orderRepository = orderRepository;
        _inventoryClient = inventoryClient;
    }

    public async Task<OrderResponse> CreateOrderAsync(
        Guid userId,
        CreateOrderRequest request)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("Authenticated user is required.");
        }

        if (request.Items.Count == 0)
        {
            throw new ArgumentException("At least one order item is required.");
        }

        if (request.Items.Any(item => item.DrugId <= 0 || item.Quantity <= 0))
        {
            throw new ArgumentException("Drug IDs and item quantities must be greater than zero.");
        }

        var inventoryDrugs = new Dictionary<int, InventoryDrug>();
        foreach (var item in request.Items)
        {
            if (inventoryDrugs.ContainsKey(item.DrugId))
            {
                throw new ArgumentException("Duplicate drug items are not allowed.");
            }

            var drug = await _inventoryClient.GetDrugAsync(item.DrugId)
                ?? throw new KeyNotFoundException($"Drug {item.DrugId} was not found.");

            if (drug.StockQuantity < item.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for drug {item.DrugId}.");
            }

            inventoryDrugs[item.DrugId] = drug;
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.Pending,
            Items = request.Items.Select(item => new OrderItem
            {
                Id = Guid.NewGuid(),
                DrugId = item.DrugId,
                Quantity = item.Quantity,
                UnitPrice = inventoryDrugs[item.DrugId].Price
            }).ToList()
        };

        order.TotalAmount = order.Items.Sum(item => item.Quantity * item.UnitPrice);

        await _orderRepository.CreateAsync(order);
        await _orderRepository.SaveChangesAsync();

        return MapToResponse(order);
    }

    public async Task<List<OrderResponse>> GetAllOrdersAsync()
    {
        var orders = await _orderRepository.GetAllAsync();
        return orders.Select(MapToResponse).ToList();
    }

    public async Task<List<OrderResponse>> GetOrderHistoryAsync(Guid userId)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("Authenticated user is required.");
        }

        var orders = await _orderRepository.GetByUserIdAsync(userId);
        return orders.Select(MapToResponse).ToList();
    }

    public async Task<OrderResponse?> GetOrderByIdAsync(Guid id)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        return order == null ? null : MapToResponse(order);
    }

    public async Task<OrderResponse> UpdateOrderAsync(
        Guid id,
        UpdateOrderRequest request)
    {
        var order = await _orderRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Order not found.");

        var items = await BuildOrderItemsAsync(request.Items);
        _orderRepository.ReplaceItems(order, items);

        order.TotalAmount = order.Items.Sum(item => item.Quantity * item.UnitPrice);

        await _orderRepository.SaveChangesAsync();
        return MapToResponse(order);
    }

    public async Task DeleteOrderAsync(Guid id)
    {
        var order = await _orderRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Order not found.");

        _orderRepository.Delete(order);
        await _orderRepository.SaveChangesAsync();
    }

    public async Task<OrderResponse> VerifyOrderAsync(Guid id)
    {
        var order = await _orderRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Order not found.");

        if (order.Status != OrderStatus.Pending)
        {
            throw new InvalidOperationException("Only pending orders can be verified.");
        }

        foreach (var item in order.Items)
        {
            var reserved = await _inventoryClient.ReserveStockAsync(
                item.DrugId,
                item.Quantity);

            if (!reserved)
            {
                throw new InvalidOperationException(
                    $"Unable to reserve stock for drug {item.DrugId}.");
            }
        }

        order.Status = OrderStatus.Verified;
        await _orderRepository.SaveChangesAsync();

        return MapToResponse(order);
    }

    private async Task<List<OrderItem>> BuildOrderItemsAsync(
        List<OrderItemRequest> requestedItems)
    {
        if (requestedItems.Count == 0)
        {
            throw new ArgumentException("At least one order item is required.");
        }

        if (requestedItems.Any(item => item.DrugId <= 0 || item.Quantity <= 0))
        {
            throw new ArgumentException("Drug IDs and item quantities must be greater than zero.");
        }

        var inventoryDrugs = new Dictionary<int, InventoryDrug>();
        foreach (var item in requestedItems)
        {
            if (inventoryDrugs.ContainsKey(item.DrugId))
            {
                throw new ArgumentException("Duplicate drug items are not allowed.");
            }

            var drug = await _inventoryClient.GetDrugAsync(item.DrugId)
                ?? throw new KeyNotFoundException($"Drug {item.DrugId} was not found.");

            if (drug.StockQuantity < item.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for drug {item.DrugId}.");
            }

            inventoryDrugs[item.DrugId] = drug;
        }

        return requestedItems.Select(item => new OrderItem
        {
            Id = Guid.NewGuid(),
            DrugId = item.DrugId,
            Quantity = item.Quantity,
            UnitPrice = inventoryDrugs[item.DrugId].Price
        }).ToList();
    }

    private static OrderResponse MapToResponse(Order order)
    {
        return new OrderResponse
        {
            Id = order.Id,
            UserId = order.UserId,
            OrderDate = order.OrderDate,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Items = order.Items.Select(item => new OrderItemResponse
            {
                Id = item.Id,
                DrugId = item.DrugId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            }).ToList()
        };
    }
}
