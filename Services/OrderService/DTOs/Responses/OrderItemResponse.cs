namespace OrderService.DTOs.Responses;

public class OrderItemResponse
{
    public Guid Id { get; set; }

    public int DrugId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}
