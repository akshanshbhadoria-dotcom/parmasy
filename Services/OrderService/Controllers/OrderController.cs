using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.DTOs.Requests;
using OrderService.Services.Interfaces;

namespace OrderService.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "The token does not contain a valid user ID." });
            }

            var order = await _orderService.CreateOrderAsync(userId, request);
            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetOrderHistory()
    {
        if (!TryGetAuthenticatedUserId(out var userId))
        {
            return Unauthorized(new { message = "The token does not contain a valid user ID." });
        }

        return Ok(await _orderService.GetOrderHistoryAsync(userId));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);

        if (order == null)
        {
            return NotFound();
        }

        if (!User.IsInRole("Admin") &&
            (!TryGetAuthenticatedUserId(out var userId) || order.UserId != userId))
        {
            return Forbid();
        }

        return Ok(order);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateOrder(
        Guid id,
        UpdateOrderRequest request)
    {
        try
        {
            var existingOrder = await _orderService.GetOrderByIdAsync(id);

            if (existingOrder == null)
            {
                return NotFound();
            }

            if (!User.IsInRole("Admin") &&
                (!TryGetAuthenticatedUserId(out var userId) || existingOrder.UserId != userId))
            {
                return Forbid();
            }

            return Ok(await _orderService.UpdateOrderAsync(id, request));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteOrder(Guid id)
    {
        var existingOrder = await _orderService.GetOrderByIdAsync(id);

        if (existingOrder == null)
        {
            return NotFound();
        }

        if (!User.IsInRole("Admin") &&
            (!TryGetAuthenticatedUserId(out var userId) || existingOrder.UserId != userId))
        {
            return Forbid();
        }

        await _orderService.DeleteOrderAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/verify")]
    public async Task<IActionResult> VerifyOrder(Guid id)
    {
        try
        {
            return Ok(await _orderService.VerifyOrderAsync(id));
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    private bool TryGetAuthenticatedUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(userIdClaim, out userId);
    }
}