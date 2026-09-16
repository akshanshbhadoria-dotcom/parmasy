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
public class InventoryControllerTests
{
    private InventoryDbContext CreateContext()
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
    public async Task UpdateStock_ShouldReturnBadRequest_WhenQuantityIsNegative()
    {
        await using var context = CreateContext();
        var controller = new InventoryController(context);
        SetRole(controller, "Admin");

        var result = await controller.UpdateStock(new UpdateInventoryDto
        {
            DrugId = 1,
            StockQuantity = -1
        });

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Test]
    public async Task UpdateStock_ShouldReturnNotFound_WhenDrugDoesNotExist()
    {
        await using var context = CreateContext();
        var controller = new InventoryController(context);
        SetRole(controller, "Admin");

        var result = await controller.UpdateStock(new UpdateInventoryDto
        {
            DrugId = 99,
            StockQuantity = 10
        });

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Test]
    public async Task GetInventory_ShouldIncludeSupplier_WhenDrugHasSupplier()
    {
        await using var context = CreateContext();
        var supplier = new Supplier { SupplierId = 1, SupplierName = "Supplier One" };
        context.Suppliers.Add(supplier);
        context.Drugs.Add(new Drug { DrugId = 2, DrugName = "Drug", SupplierId = 1 });
        await context.SaveChangesAsync();
        var controller = new InventoryController(context);
        SetRole(controller, "Doctor");

        var result = await controller.GetInventory();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var drugs = ok.Value.Should().BeAssignableTo<List<Drug>>().Subject;
        drugs.Should().ContainSingle().Which.Supplier.Should().NotBeNull();
    }

    [Test]
    public async Task UpdateStock_ShouldUpdateQuantityAndIncludeSupplier_WhenDrugExists()
    {
        await using var context = CreateContext();
        context.Suppliers.Add(new Supplier { SupplierId = 1, SupplierName = "Supplier One" });
        context.Drugs.Add(new Drug { DrugId = 2, DrugName = "Drug", SupplierId = 1, StockQuantity = 5 });
        await context.SaveChangesAsync();
        var controller = new InventoryController(context);
        SetRole(controller, "Admin");

        var result = await controller.UpdateStock(new UpdateInventoryDto
        {
            DrugId = 2,
            StockQuantity = 20
        });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var drug = ok.Value.Should().BeOfType<Drug>().Subject;
        drug.StockQuantity.Should().Be(20);
        drug.Supplier.Should().NotBeNull();
    }
}
