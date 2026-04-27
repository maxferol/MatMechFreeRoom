using MongoDB.Driver;
using MongoDB.Bson;
using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Value_Object.User;
using FreeRoom.backend.src.Domain.Enum;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;

namespace FreeRoom.backend.src.Infrastructure.UserStorage;

public class UserMongoDB
{
    private readonly IMongoCollection<BsonDocument> CollectionUsers;

    public UserMongoDB(string connectionString, string databaseName)
    {
        var client = new MongoClient(connectionString);
        var database = client.GetDatabase(databaseName);
        CollectionUsers = database.GetCollection<BsonDocument>("Users");
    }

    public async Task<User> CreateUser(User user)
    {
        try
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var bsonDocument = new BsonDocument
            {
                { "userId", user.Id.Value.ToString() },
                { "login", user.Login.Value },
                { "passwordHash", user.PasswordHash.Value },
                { "role", (int)user.Role } // Сохраняем роль как число
            };

            await CollectionUsers.InsertOneAsync(bsonDocument);
            return user;
        }
        catch (Exception ex)
        {
            throw new Exception($"Ошибка при создании пользователя: {ex.Message}", ex);
        }
    }

    public async Task<User?> GetById(Guid id)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userId", id.ToString());
        var document = await CollectionUsers.Find(filter).FirstOrDefaultAsync();
        return document == null ? null : MapToUser(document);
    }

    public async Task<User?> GetByLogin(string login)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("login", login);
        var document = await CollectionUsers.Find(filter).FirstOrDefaultAsync();
        return document == null ? null : MapToUser(document);
    }

    public async Task<List<User>> GetAll()
    {
        var documents = await CollectionUsers.Find(new BsonDocument()).ToListAsync();
        return documents.Select(MapToUser).ToList();
    }

    public async Task<bool> DeleteUser(Guid id)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userId", id.ToString());
        var result = await CollectionUsers.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }

    public async Task<bool> UpdateUser(User user)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("userId", user.Id.Value.ToString());
        var update = Builders<BsonDocument>.Update
            .Set("passwordHash", user.PasswordHash.Value)
            .Set("role", (int)user.Role);

        var result = await CollectionUsers.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    private static User MapToUser(BsonDocument document)
    {
        // 1. Создаем Value Objects
        var login = new Login(document["login"].AsString);
        var passwordHash = new PasswordHash(document["passwordHash"].AsString);
        var role = (UserRole)document["role"].AsInt32;

        // 2. Создаем экземпляр через приватный конструктор (login, password, role)
        var user = (User)Activator.CreateInstance(
            typeof(User),
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public,
            null,
            new object[] { login, passwordHash, role },
            null)!;

        // 3. Устанавливаем Id через рефлексию
        var idProperty = typeof(User).GetProperty("Id");
        if (document.Contains("userId"))
        {
            var idValue = new UserId(Guid.Parse(document["userId"].AsString));
            idProperty?.SetValue(user, idValue);
        }

        return user;
    }
}