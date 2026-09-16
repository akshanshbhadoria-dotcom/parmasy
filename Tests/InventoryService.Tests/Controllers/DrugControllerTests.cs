using FluentAssertions;
using InventoryService.Controllers;
using InventoryService.Data;
using InventoryService.DTOs;
using InventoryService.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Security.Claims;

namespace InventoryService.Tests.Controllers;

[TestFixture]
public class DrugControllerTests
{
    private static InventoryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new InventoryDbContext(options);
    }

    private static void SetRole(ControllerBase controller, string role)
    {
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    [new Claim(ClaimTypes.Role, role)], "Test"))
            }
        };
    }

    [Test]
    public async Task ReserveStock_ShouldReturnDoctorSummary_WhenDoctorReservesAvailableStock()
    {
        await using var context = CreateContext();
        context.Suppliers.Add(new Supplier { SupplierId = 1, SupplierName = "Supplier" });
        context.Drugs.Add(new Drug
        {
            DrugId = 2,
            DrugName = "Paracetamol",
            Description = "Pain relief",
            Price = 12,
            StockQuantity = 10,
            SupplierId = 1
        });
        await context.SaveChangesAsync();
        var controller = new DrugController(context);
        SetRole(controller, "Doctor");

        var result = await controller.ReserveStock(2, new ReserveStockDto { Quantity = 2 });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var summary = ok.Value.Should().BeOfType<DoctorOrderSummaryDto>().Subject;
        summary.TotalPrice.Should().Be(24);
        summary.Quantity.Should().Be(2);
    }

    [Test]
    public async Task ReserveStock_ShouldReturnConflict_WhenStockIsInsufficient()
    {
        await using var context = CreateContext();
        context.Suppliers.Add(new Supplier { SupplierId = 1, SupplierName = "Supplier" });
        context.Drugs.Add(new Drug { DrugId = 2, SupplierId = 1, StockQuantity = 1 });
        await context.SaveChangesAsync();
        var controller = new DrugController(context);
        SetRole(controller, "Doctor");

        var result = await controller.ReserveStock(2, new ReserveStockDto { Quantity = 2 });

        result.Should().BeOfType<ConflictObjectResult>();
    }

    [Test]
    public async Task CreateDrug_ShouldReturnNotFound_WhenSupplierDoesNotExist()
    {
        await using var context = CreateContext();
        var controller = new DrugController(context);
        SetRole(controller, "Admin");

        var result = await controller.CreateDrug(new CreateDrugDto
        {
            DrugName = "Drug",
            Price = 10,
            StockQuantity = 5,
            SupplierId = 99
        });

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Test]
    public async Task DeleteDrug_ShouldReturnNoContent_WhenDrugExists()
    {
        await using var context = CreateContext();
        context.Drugs.Add(new Drug { DrugId = 2, DrugName = "Drug" });
        await context.SaveChangesAsync();
        var controller = new DrugController(context);
        SetRole(controller, "Admin");

        var result = await controller.DeleteDrug(2);

        result.Should().BeOfType<NoContentResult>();
        (await context.Drugs.FindAsync(2)).Should().BeNull();
    }
}
