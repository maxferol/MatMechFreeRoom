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
        return new PasswordHash(value);
    }

    public override string ToString() => "нет дружочек пиши брут форс";
}