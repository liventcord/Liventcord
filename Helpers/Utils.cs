using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

public class IdLengthValidationAttribute : ValidationAttribute
{
    private const int RequiredLength = 18;

    public IdLengthValidationAttribute() : base("The id must be 18 characters long.") {}

    public override bool IsValid(object? value)
    {
        if (value is string id)
        {
            return id.Length == RequiredLength;
        }
        return false;
    }
}


namespace LiventCord.Helpers
{
    public static partial class Utils
    {
        public static string CreateRandomId()
        {
            Random random = new();
            string result = string.Empty;
            for (int i = 0; i < 18; i++)
            {
                result += random.Next(0, 10).ToString();
            }
            return result;
        }
        public static bool IsValidId(string input) {
            if (string.IsNullOrEmpty(input)) return false;
            return input.Length == 18 && Regex.IsMatch(input, @"^\d{18}$");
        }
    }
}
