using MongoDB.Driver;
using MongoDB.Bson;
using System.Reflection;
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
            if (user == null) throw new ArgumentNullException(nameof(user));

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
                { "passwordHash", user.PasswordHash.Value },
                { "role", user.Role.ToString() }
            };

            await _collectionUsers.InsertOneAsync(bsonDocument);
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
        var filter = Builders<BsonDocument>.Filter.Eq("loginUser", login);
        var document = await _collectionUsers.Find(filter).FirstOrDefaultAsync();
        return document == null ? null : MapToUser(document);
    }

    public async Task<User?> GetById(Guid id)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userId", id.ToString());
        var document = await _collectionUsers.Find(filter).FirstOrDefaultAsync();
        return document == null ? null : MapToUser(document);
    }

    private static User MapToUser(BsonDocument document)
    {
        // 1. Восстанавливаем Login через GetConstructor (надежнее Activator)
        var loginCtor = typeof(Login).GetConstructor(
            BindingFlags.NonPublic | BindingFlags.Instance,
            null,
            new[] { typeof(string), typeof(string), typeof(string) },
            null);

        var login = (Login)loginCtor!.Invoke(new object[] { 
            document["firstName"].AsString, 
            document["secondName"].AsString, 
            document["loginUser"].AsString 
        });

        // 2. Восстанавливаем PasswordHash и Role
        var passwordHash = PasswordHash.CreateHash(document["passwordHash"].AsString);
        var role = Enum.Parse<UserRole>(document["role"].AsString);

        // 3. Восстанавливаем User через GetConstructor
        var userCtor = typeof(User).GetConstructor(
            BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public,
            null,
            new[] { typeof(Login), typeof(PasswordHash), typeof(UserRole) },
            null);

        if (userCtor == null)
            throw new Exception("Constructor for User not found via reflection!");

        var user = (User)userCtor.Invoke(new object[] { login, passwordHash, role });

        // 4. Устанавливаем Id
        var idProperty = typeof(User).GetProperty("Id");
        if (document.Contains("userId") && idProperty != null)
        {
            var idValue = new UserId(Guid.Parse(document["userId"].AsString));
            idProperty.SetValue(user, idValue);
        }

        return user;
    }
}