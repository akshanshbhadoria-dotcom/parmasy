namespace OrderService.DTOs.Responses;

public class OrderResponse
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public DateTime OrderDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    public List<OrderItemResponse> Items { get; set; } = new();
}