using System.Security.Cryptography;
using System.Text;

namespace FreeRoom.backend.src.Infrastructure.GetEntitiesId;

public record UserId(Guid Value)
{
    public static UserId New() => new UserId(Guid.NewGuid());
    
    // Метод для создания стабильного Guid из логина (строки)
    public static UserId FromLogin(string login)
    {
        using (MD5 md5 = MD5.Create())
        {
            byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(login));
            return new UserId(new Guid(hash));
        }
    }

    public override string ToString() => Value.ToString();
}