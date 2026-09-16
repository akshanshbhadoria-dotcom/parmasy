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
public class SupplierControllerTests
{
    [Test]
    public async Task DeleteSupplier_ShouldReturnConflict_WhenSupplierHasDrugs()
    {
        await using var context = CreateContext();
        context.Suppliers.Add(new Supplier { SupplierId = 1, SupplierName = "Supplier" });
        context.Drugs.Add(new Drug { DrugId = 1, SupplierId = 1 });
        await context.SaveChangesAsync();
        var controller = new SupplierController(context);
        SetRole(controller, "Admin");

        var result = await controller.DeleteSupplier(1);

        result.Should().BeOfType<ConflictObjectResult>();
    }

    [Test]
    public async Task CreateSupplier_ShouldReturnCreated_WhenRequestIsValid()
    {
        await using var context = CreateContext();
        var controller = new SupplierController(context);
        SetRole(controller, "Admin");

        var result = await controller.CreateSupplier(new CreateSupplierDto
        {
            SupplierName = "Supplier",
            Email = "supplier@example.com",
            Phone = "1234567890"
        });

        result.Should().BeOfType<CreatedAtActionResult>();
        (await context.Suppliers.CountAsync()).Should().Be(1);
    }

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
}
