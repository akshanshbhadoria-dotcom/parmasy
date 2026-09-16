using InventoryService.Data;
using InventoryService.DTOs;
using InventoryService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryService.Controllers;

[ApiController]
[Route("api/drugs")]
[Authorize]
public class DrugController : ControllerBase
{
    private readonly InventoryDbContext _context;

    public DrugController(InventoryDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<IActionResult> GetDrugs()
    {
        return Ok(await _context.Drugs
            .Include(d => d.Supplier)
            .AsNoTracking()
            .ToListAsync());
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<IActionResult> GetDrug(int id)
    {
        var drug = await _context.Drugs
            .Include(d => d.Supplier)
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.DrugId == id);

        return drug == null ? NotFound() : Ok(drug);
    }

    [HttpPost("{id:int}/reserve")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<IActionResult> ReserveStock(
        int id,
        ReserveStockDto request)
    {
        if (request.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be greater than zero." });
        }

        var drug = await _context.Drugs
            .Include(item => item.Supplier)
            .FirstOrDefaultAsync(item => item.DrugId == id);

        if (drug == null)
        {
            return NotFound();
        }

        if (drug.StockQuantity < request.Quantity)
        {
            return Conflict(new { message = "Insufficient stock." });
        }

        drug.StockQuantity -= request.Quantity;
        await _context.SaveChangesAsync();

        var totalPrice = request.Quantity * drug.Price;

        if (User.IsInRole("Admin"))
        {
            return Ok(new AdminOrderSummaryDto
            {
                DrugId = drug.DrugId,
                DrugName = drug.DrugName,
                Description = drug.Description,
                Quantity = request.Quantity,
                PricePerUnit = drug.Price,
                TotalPrice = totalPrice,
                StockQuantity = drug.StockQuantity,
                SupplierId = drug.SupplierId,
                Supplier = drug.Supplier == null
                    ? null
                    : new SupplierOrderSummaryDto
                    {
                        SupplierId = drug.Supplier.SupplierId,
                        SupplierName = drug.Supplier.SupplierName,
                        Email = drug.Supplier.Email,
                        Phone = drug.Supplier.Phone
                    }
            });
        }

        if (User.IsInRole("Doctor"))
        {
            return Ok(new DoctorOrderSummaryDto
            {
                DrugName = drug.DrugName,
                Description = drug.Description,
                Quantity = request.Quantity,
                PricePerUnit = drug.Price,
                TotalPrice = totalPrice
            });
        }

        return Forbid();
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateDrug(CreateDrugDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.DrugName) ||
            dto.Price < 0 ||
            dto.StockQuantity < 0 ||
            dto.SupplierId <= 0)
        {
            return BadRequest(new
            {
                message = "Drug name is required and price, stock, and supplier values must be valid."
            });
        }

        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(item => item.SupplierId == dto.SupplierId);

        if (supplier == null)
        {
            return NotFound(new { message = "Supplier not found." });
        }

        var drug = new Drug
        {
            DrugName = dto.DrugName,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            SupplierId = dto.SupplierId,
            Supplier = supplier
        };

        await _context.Drugs.AddAsync(drug);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDrug), new { id = drug.DrugId }, drug);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateDrug(int id, UpdateDrugDto dto)
    {
        if (id <= 0 ||
            string.IsNullOrWhiteSpace(dto.DrugName) ||
            dto.Price < 0 ||
            dto.StockQuantity < 0 ||
            dto.SupplierId <= 0)
        {
            return BadRequest(new
            {
                message = "Drug name is required and price, stock, and supplier values must be valid."
            });
        }

        var drug = await _context.Drugs
            .FirstOrDefaultAsync(item => item.DrugId == id);

        if (drug == null)
        {
            return NotFound();
        }

        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(item => item.SupplierId == dto.SupplierId);

        if (supplier == null)
        {
            return NotFound(new { message = "Supplier not found." });
        }

        drug.DrugName = dto.DrugName;
        drug.Description = dto.Description;
        drug.Price = dto.Price;
        drug.StockQuantity = dto.StockQuantity;
        drug.SupplierId = dto.SupplierId;
        drug.Supplier = supplier;

        await _context.SaveChangesAsync();
        return Ok(drug);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDrug(int id)
    {
        var drug = await _context.Drugs
            .FirstOrDefaultAsync(item => item.DrugId == id);

        if (drug == null)
        {
            return NotFound();
        }

        _context.Drugs.Remove(drug);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}