using System.Text.RegularExpressions;
using FreeRoom.backend.src.Domain.Value_Object.User; // Для PasswordHash

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
        // Проверка на null
        if (firstName == null)
            throw new ArgumentNullException(nameof(firstName), "Имя не может быть null");
    
        if (login == null)
            throw new ArgumentNullException(nameof(login), "Логин не может быть null");
    
        // Удаляем лишние пробелы
        firstName = firstName.Trim();
        login = login.Trim();
    
        // Проверка на пустоту
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("Имя не может быть пустым", nameof(firstName));
    
        if (string.IsNullOrWhiteSpace(login))
            throw new ArgumentException("Логин не может быть пустым", nameof(login));
    
        // Для фамилии: если null или пустая, то используем пустую строку
        if (secondName == null)
            secondName = "";
        else
            secondName = secondName.Trim();
    
        // Проверка на пробелы (только для непустых строк)
        if (firstName.Contains(" "))
            throw new ArgumentException("Имя не должно содержать пробелов", nameof(firstName));
    
        if (login.Contains(" "))
            throw new ArgumentException("Логин не должен содержать пробелов", nameof(login));
    
        // Для фамилии проверяем только если она не пустая
        if (!string.IsNullOrEmpty(secondName) && secondName.Contains(" "))
            throw new ArgumentException("Фамилия не должна содержать пробелов", nameof(secondName));
    
        // Дополнительная проверка на минимальную длину
        if (firstName.Length < 2)
            throw new ArgumentException("Имя должно содержать минимум 2 символа", nameof(firstName));
    
        if (login.Length < 3)
            throw new ArgumentException("Логин должен содержать минимум 3 символа", nameof(login));
    
        return new Login(firstName, secondName, login);
    }
    
    
}