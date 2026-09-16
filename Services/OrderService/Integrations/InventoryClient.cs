using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace OrderService.Integrations;

public interface IInventoryClient
{
    Task<InventoryDrug?> GetDrugAsync(int drugId, CancellationToken cancellationToken = default);

    Task<bool> ReserveStockAsync(int drugId, int quantity, CancellationToken cancellationToken = default);
}

public sealed class InventoryClient : IInventoryClient
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public InventoryClient(
        HttpClient httpClient,
        IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClient;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<InventoryDrug?> GetDrugAsync(
        int drugId,
        CancellationToken cancellationToken = default)
    {
        using var response = await SendAsync(
            HttpMethod.Get,
            $"api/drugs/{drugId}",
            cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        await EnsureSuccessAsync(response);
        return await response.Content.ReadFromJsonAsync<InventoryDrug>(cancellationToken);
    }

    public async Task<bool> ReserveStockAsync(
        int drugId,
        int quantity,
        CancellationToken cancellationToken = default)
    {
        using var response = await SendAsync(
            HttpMethod.Post,
            $"api/drugs/{drugId}/reserve",
            JsonContent.Create(new { Quantity = quantity }),
            cancellationToken);

        if (response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.Conflict)
        {
            return false;
        }

        await EnsureSuccessAsync(response);
        return true;
    }

    private async Task<HttpResponseMessage> SendAsync(
        HttpMethod method,
        string requestUri,
        CancellationToken cancellationToken)
    {
        return await SendAsync(method, requestUri, null, cancellationToken);
    }

    private async Task<HttpResponseMessage> SendAsync(
        HttpMethod method,
        string requestUri,
        HttpContent? content,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(method, requestUri)
        {
            Content = content
        };

        var authorization = _httpContextAccessor.HttpContext?
            .Request.Headers.Authorization.ToString();

        if (!string.IsNullOrWhiteSpace(authorization))
        {
            request.Headers.TryAddWithoutValidation("Authorization", authorization);
        }

        return await _httpClient.SendAsync(request, cancellationToken);
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var details = await response.Content.ReadAsStringAsync();
        throw new HttpRequestException(
            $"InventoryService returned {(int)response.StatusCode}: {details}");
    }
}

public sealed class InventoryDrug
{
    public int DrugId { get; set; }

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }
}
