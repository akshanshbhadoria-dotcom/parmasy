namespace InventoryService.DTOs;

public class CreateSupplierDto
{
    public string SupplierName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;
}