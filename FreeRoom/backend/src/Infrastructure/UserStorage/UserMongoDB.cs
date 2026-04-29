using MongoDB.Driver;
using MongoDB.Bson;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Value_Object.User;
using FreeRoom.backend.src.Domain.Enum;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;

namespace FreeRoom.backend.src.Infrastructure.UserStorage;

public class UserMongoDB
{
    private readonly IMongoCollection<BsonDocument> _collectionUsers;

    public UserMongoDB(string connectionString, string databaseName)
    {
        var client = new MongoClient(connectionString);
        var database = client.GetDatabase(databaseName);
        _collectionUsers = database.GetCollection<BsonDocument>("Users");
        Console.WriteLine($"MongoDB (Users) подключен: {databaseName}");
    }

    public async Task<User?> CreateUser(User user)
    {
        try
        {
            if (user == null) 
                throw new ArgumentNullException(nameof(user), "User не должен быть null");

            // Проверяем, нет ли уже пользователя с таким логином
            if (await GetByLogin(user.Login.LoginUser) != null)
            {
                Console.WriteLine("Пользователь с таким логином уже существует!");
                return null;
            }

            var bsonDocument = new BsonDocument
            {
                { "userId", user.Id.Value.ToString() },
                { "firstName", user.Login.FirstName },
                { "secondName", user.Login.SecondName },
                { "loginUser", user.Login.LoginUser },
                { "passwordHash", user.PasswordHash.Value }, // Предполагаем наличие свойства Value
                { "role", user.Role.ToString() }
            };

            await _collectionUsers.InsertOneAsync(bsonDocument);
            Console.WriteLine($"Пользователь {user.Login.LoginUser} сохранен в MongoDB!");
            return user;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при сохранении пользователя: {ex.Message}");
            throw;
        }
    }

    public async Task<User?> GetByLogin(string login)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("loginUser", login);
            var document = await _collectionUsers.Find(filter).FirstOrDefaultAsync();
            
            return document == null ? null : MapToUser(document);
        }
        catch (Exception ex)
        {
            throw new Exception($"Ошибка при поиске пользователя по логину: {ex.Message}", ex);
        }
    }

    public async Task<User?> GetById(Guid id)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("userId", id.ToString());
            var document = await _collectionUsers.Find(filter).FirstOrDefaultAsync();
            
            return document == null ? null : MapToUser(document);
        }
        catch (Exception ex)
        {
            throw new Exception($"Ошибка при поиске пользователя по ID: {ex.Message}", ex);
        }
    }

    private static User MapToUser(BsonDocument document)
    {
        // 1. Восстанавливаем Login через рефлексию (так как конструктор приватный)
        var login = (Login)Activator.CreateInstance(
            typeof(Login),
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
            null,
            new object[] { 
                document["firstName"].AsString, 
                document["secondName"].AsString, 
                document["loginUser"].AsString 
            },
            null)!;

        // 2. Восстанавливаем PasswordHash и Role
        var passwordHash = new PasswordHash(document["passwordHash"].AsString);
        var role = Enum.Parse<UserRole>(document["role"].AsString);

        // 3. Создаем User через приватный конструктор
        var user = (User)Activator.CreateInstance(
            typeof(User),
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance,
            null,
            new object[] { login, passwordHash, role },
            null)!;

        // 4. Устанавливаем Id
        var idProperty = typeof(User).GetProperty("Id");
        if (document.Contains("userId"))
        {
            var idValue = new UserId(Guid.Parse(document["userId"].AsString));
            idProperty?.SetValue(user, idValue);
        }

        return user;
    }
}