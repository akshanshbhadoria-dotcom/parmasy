namespace InventoryService.DTOs;

public class SupplierOrderSummaryDto
{
    public int SupplierId { get; set; }

    public string SupplierName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;
}