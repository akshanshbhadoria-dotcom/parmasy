namespace InventoryService.DTOs;

public class AdminOrderSummaryDto
{
    public int DrugId { get; set; }

    public string DrugName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal PricePerUnit { get; set; }

    public decimal TotalPrice { get; set; }

    public int StockQuantity { get; set; }

    public int SupplierId { get; set; }

    public SupplierOrderSummaryDto? Supplier { get; set; }
}