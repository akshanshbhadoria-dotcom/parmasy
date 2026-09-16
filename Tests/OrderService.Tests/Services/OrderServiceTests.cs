using FluentAssertions;
using Moq;
using NUnit.Framework;
using OrderService.DTOs.Requests;
using OrderService.Entities;
using OrderService.Integrations;
using OrderService.Repositories.Interfaces;

namespace OrderService.Tests.Services;

[TestFixture]
public class OrderServiceTests
{
    private Mock<IOrderRepository> _repository = null!;
    private Mock<IInventoryClient> _inventory = null!;
    private OrderService.Services.OrderService _service = null!;

    [SetUp]
    public void SetUp()
    {
        _repository = new Mock<IOrderRepository>();
        _inventory = new Mock<IInventoryClient>();
        _service = new OrderService.Services.OrderService(
            _repository.Object,
            _inventory.Object);
    }

    [Test]
    public async Task CreateOrderAsync_ShouldCalculateTotalAndPersist_WhenRequestIsValid()
    {
        _inventory.Setup(x => x.GetDrugAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new InventoryDrug { DrugId = 2, Price = 12, StockQuantity = 20 });
        Order? savedOrder = null;
        _repository.Setup(x => x.CreateAsync(It.IsAny<Order>()))
            .Callback<Order>(order => savedOrder = order)
            .ReturnsAsync((Order order) => order);

        var response = await _service.CreateOrderAsync(Guid.NewGuid(), new CreateOrderRequest
        {
            Items = [new OrderItemRequest { DrugId = 2, Quantity = 3 }]
        });

        savedOrder.Should().NotBeNull();
        savedOrder!.TotalAmount.Should().Be(36);
        response.Items.Should().ContainSingle(item => item.DrugId == 2 && item.UnitPrice == 12);
        _repository.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task CreateOrderAsync_ShouldRejectDuplicateDrugs_WhenRequestContainsDuplicates()
    {
        _inventory.Setup(x => x.GetDrugAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new InventoryDrug { DrugId = 2, Price = 10, StockQuantity = 10 });

        var action = () => _service.CreateOrderAsync(Guid.NewGuid(), new CreateOrderRequest
        {
            Items =
            [
                new OrderItemRequest { DrugId = 2, Quantity = 1 },
                new OrderItemRequest { DrugId = 2, Quantity = 2 }
            ]
        });

        await action.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Duplicate drug items are not allowed.");
        _inventory.Verify(x => x.GetDrugAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public async Task UpdateOrderAsync_ShouldReplaceItemsAndRecalculateTotal_WhenOrderExists()
    {
        var order = new Order { Id = Guid.NewGuid(), Items = [new OrderItem { DrugId = 1, Quantity = 1, UnitPrice = 5 }] };
        _repository.Setup(x => x.GetByIdAsync(order.Id)).ReturnsAsync(order);
        _inventory.Setup(x => x.GetDrugAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new InventoryDrug { DrugId = 2, Price = 10, StockQuantity = 10 });
        _repository.Setup(x => x.ReplaceItems(order, It.IsAny<List<OrderItem>>()))
            .Callback<Order, List<OrderItem>>((existingOrder, items) => existingOrder.Items = items);

        var response = await _service.UpdateOrderAsync(order.Id, new UpdateOrderRequest
        {
            Items = [new OrderItemRequest { DrugId = 2, Quantity = 2 }]
        });

        response.TotalAmount.Should().Be(20);
        response.Items.Should().ContainSingle(item => item.DrugId == 2);
        _repository.Verify(x => x.ReplaceItems(order, It.IsAny<List<OrderItem>>()), Times.Once);
    }

    [Test]
    public async Task VerifyOrderAsync_ShouldSetVerifiedStatus_WhenInventoryReservationSucceeds()
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            Status = OrderStatus.Pending,
            Items = [new OrderItem { DrugId = 2, Quantity = 2, UnitPrice = 10 }]
        };
        _repository.Setup(x => x.GetByIdAsync(order.Id)).ReturnsAsync(order);
        _inventory.Setup(x => x.ReserveStockAsync(2, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var response = await _service.VerifyOrderAsync(order.Id);

        order.Status.Should().Be(OrderStatus.Verified);
        response.Status.Should().Be(nameof(OrderStatus.Verified));
        _repository.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task DeleteOrderAsync_ShouldThrowNotFound_WhenOrderDoesNotExist()
    {
        var id = Guid.NewGuid();
        _repository.Setup(x => x.GetByIdAsync(id)).ReturnsAsync((Order?)null);

        var action = () => _service.DeleteOrderAsync(id);

        await action.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Order not found.");
        _repository.Verify(x => x.Delete(It.IsAny<Order>()), Times.Never);
    }
}
