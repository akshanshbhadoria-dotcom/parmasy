using InventoryService.Data;
using InventoryService.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryService.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public InventoryController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetInventory()
    {
        var inventory = await _context.Drugs
            .Include(drug => drug.Supplier)
            .AsNoTracking()
            .OrderBy(drug => drug.DrugName)
            .ToListAsync();

        return Ok(inventory);
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateStock(UpdateInventoryDto request)
    {
        if (request.DrugId <= 0)
        {
            return BadRequest(new { message = "DrugId must be greater than zero." });
        }

        if (request.StockQuantity < 0)
        {
            return BadRequest(new { message = "StockQuantity cannot be negative." });
        }

        var drug = await _context.Drugs
            .Include(item => item.Supplier)
            .FirstOrDefaultAsync(item => item.DrugId == request.DrugId);

        if (drug == null)
        {
            return NotFound(new { message = "Drug not found." });
        }

        drug.StockQuantity = request.StockQuantity;
        await _context.SaveChangesAsync();

        return Ok(drug);
    }
}
