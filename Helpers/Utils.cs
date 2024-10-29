using System;
using System.Text.RegularExpressions;

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
