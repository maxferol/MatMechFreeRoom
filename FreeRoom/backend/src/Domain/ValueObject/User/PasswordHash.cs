namespace FreeRoom.backend.src.Domain.Value_Object.User;

public class PasswordHash
{
    public string Value { get; }

    private PasswordHash()
    {
        Value = string.Empty;
    }

    private PasswordHash(string value)
    {
        Value = value;
    }

    public static PasswordHash CreateHash(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Хеш пароля должен быть не пустым и без пробелов", nameof(value));
        
        // TODO: Добавить реальное хэширование (например, BCrypt)
        // return new PasswordHash(BCrypt.HashPassword(value));
        
        return new PasswordHash(value); // Пока сохраняем как есть
    }

    // Добавьте этот метод для проверки пароля
    public static bool Verify(string password, PasswordHash hash)
    {
        if (string.IsNullOrWhiteSpace(password) || hash == null)
            return false;
        
        // TODO: Добавить реальную проверку хэша
        // return BCrypt.Verify(password, hash.Value);
        
        return password == hash.Value; // Временная простая проверка
    }

    public override string ToString() => "нет дружочек пиши брут форс";
}