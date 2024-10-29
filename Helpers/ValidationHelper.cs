using System.Text.RegularExpressions;

namespace LiventCord.Helpers
{
    public class ValidationHelper
    {
        public static bool ValidateEmail(string email)
        {
            try
            {
                var pattern = new Regex(@"^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$");
                return pattern.IsMatch(email);
            }
            catch
            {
                return false;
            }
        }

        public static bool ValidateRegistrationParameters(string email, string password, string nickname)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(nickname))
                return false;
            if (email.Length < 6 || password.Length < 3 || nickname.Length < 1)
                return false;

            var emailPattern = @"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$";
            if (!Regex.IsMatch(email, emailPattern))
                return false;

            return true;
        }
    }
}
