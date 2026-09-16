namespace OrderService.DTOs.Requests;

public class CreateOrderRequest
{
    public List<OrderItemRequest> Items { get; set; } = new();
}