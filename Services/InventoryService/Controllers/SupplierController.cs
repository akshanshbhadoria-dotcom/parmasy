using InventoryService.Data;
using InventoryService.DTOs;
using InventoryService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryService.Controllers;

[ApiController]
[Route("api/suppliers")]
[Authorize]
public class SupplierController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public SupplierController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSuppliers()
    {
        return Ok(await _context.Suppliers
            .AsNoTracking()
            .OrderBy(supplier => supplier.SupplierName)
            .ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> CreateSupplier(CreateSupplierDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.SupplierName) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Phone))
        {
            return BadRequest(new
            {
                message = "Supplier name, email, and phone are required."
            });
        }

        var supplier = new Supplier
        {
            SupplierName = dto.SupplierName,
            Email = dto.Email,
            Phone = dto.Phone
        };

        await _context.Suppliers.AddAsync(supplier);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSuppliers), new { id = supplier.SupplierId }, supplier);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(item => item.SupplierId == id);

        if (supplier == null)
        {
            return NotFound(new { message = "Supplier not found." });
        }

        var hasDrugs = await _context.Drugs
            .AnyAsync(drug => drug.SupplierId == id);

        if (hasDrugs)
        {
            return Conflict(new
            {
                message = "Supplier cannot be deleted while drugs are linked to it."
            });
        }

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}