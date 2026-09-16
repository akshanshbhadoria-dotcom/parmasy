namespace InventoryService.DTOs;

public class UpdateDrugDto
{
    public string DrugName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public int SupplierId { get; set; }
}
