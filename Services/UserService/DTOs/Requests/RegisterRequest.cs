using System.ComponentModel.DataAnnotations;

namespace UserService.DTOs.Requests;

public class RegisterRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "MobileNumber must contain exactly 10 digits.")]
    public string MobileNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"(?i)^(ADMIN|DOCTOR)$", ErrorMessage = "Role must be Admin or Doctor.")]
    public string Role { get; set; } = string.Empty;
}