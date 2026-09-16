using System.Text.Json.Serialization;

namespace InventoryService.Models;

public class Supplier
{
    public int SupplierId { get; set; }

    public string SupplierName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<Drug> Drugs { get; set; }
        = new List<Drug>();
}