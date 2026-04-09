using System.Text.RegularExpressions;

namespace FreeRoom.backend.src.Domain.Value_Object.User;

public class Login
{
    static readonly int MaxUserLength = 20;
    static readonly int MinUserLength = 4;
    public string FirstName{ get; }
    public string SecondName{ get; }
    public string LoginUser{ get; }
    
    private static readonly Regex LoginPattern = new Regex(@"^[a-zA-Z0-9_\-\.]+$");

    private Login(string firstName, string secondName, string login)
    {
        
        FirstName = firstName;
        SecondName = secondName;
        LoginUser = login;
    }

    private Login() //для десириализации БД
    {
        FirstName = string.Empty;
        SecondName = string.Empty;
        LoginUser = string.Empty;
    }
    
    public static Login CreateLogin(string firstName, string secondName, string login)
    {
        if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(firstName) 
                                             || string.IsNullOrWhiteSpace(secondName))
            throw new ArgumentNullException("The login or firstName or secondName must be space-free or non-empty",
                nameof(login));
        if (login.Length < MinUserLength || login.Length > MaxUserLength)
            throw new ArgumentException("The login must be between 4 and 20 characters", nameof(login));
        if (!LoginPattern.IsMatch(login))
            throw new ArgumentException("The login must be a valid login format", nameof(login));
        
        return new Login(firstName, secondName, login);
    }
}