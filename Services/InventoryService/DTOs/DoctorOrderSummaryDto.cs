namespace InventoryService.DTOs;

public class DoctorOrderSummaryDto
{
    public string DrugName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal PricePerUnit { get; set; }

    public decimal TotalPrice { get; set; }
}