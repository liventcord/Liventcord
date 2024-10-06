using System;

namespace MyPostgresApp.Helpers
{
    public static class Utils
    {
        public static string CreateRandomId()
        {
            Random random = new Random();
            string result = string.Empty;
            for (int i = 0; i < 18; i++)
            {
                result += random.Next(0, 10).ToString();
            }
            return result;
        }
    }
}
