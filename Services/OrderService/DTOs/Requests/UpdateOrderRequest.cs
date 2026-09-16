namespace OrderService.DTOs.Requests;

public class UpdateOrderRequest
{
    public List<OrderItemRequest> Items { get; set; } = new();
}