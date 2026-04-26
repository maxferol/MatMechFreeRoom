// using FreeRoom.backend.src.Domain.Interfaces;
// using FreeRoom.backend.src.Domain.Enities;
// using FreeRoom.backend.src.Domain.Value_Object.User;
// using FreeRoom.backend.src.Domain.Enum;
// using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
// using MongoDB.Driver;
// using MongoDB.Bson;
//
// namespace FreeRoom.backend.src.Infrastructure.UserStorage;
//
// public class UserMongoDB : IUserRepository
// {
//     private readonly IMongoCollection<BsonDocument> CollectionUsers;
//
//     public UserMongoDB(string connectionString, string databaseName)
//     {
//         var client = new MongoClient(connectionString);
//         var database = client.GetDatabase(databaseName);
//         CollectionUsers = database.GetCollection<BsonDocument>("Users");
//     }
//
//     public async Task<User> CreateUser(User user)
//     {
//         try
//         {
//             if (user == null)
//                 throw new ArgumentNullException(nameof(user));
//
//             var bsonDocument = new BsonDocument
//             {
//                 { "userId", user.Id.Value.ToString() },
//                 { "login", new BsonDocument 
//                     { 
//                         { "firstName", user.Login.FirstName },
//                         { "secondName", user.Login.SecondName },
//                         { "loginUser", user.Login.LoginUser }
//                     } 
//                 },
//                 { "passwordHash", user.PasswordHash.Value },
//                 { "role", user.Role.ToString() }
//             };
//
//             await CollectionUsers.InsertOneAsync(bsonDocument);
//             return user;
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine($"Ошибка при создании пользователя: {ex.Message}");
//             throw;
//         }
//     }
//
//     public async Task<User?> GetById(Guid id)
//     {
//         try
//         {
//             var filter = Builders<BsonDocument>.Filter.Eq("userId", id.ToString());
//             var document = await CollectionUsers.Find(filter).FirstOrDefaultAsync();
//             
//             // return document == null ? null : MapToUser(document);
//         }
//         catch (Exception ex)
//         {
//             throw new Exception($"Ошибка при получении пользователя по Id: {ex.Message}");
//         }
//     }
//
//     public async Task<User?> GetByLogin(string login, CancellationToken cancellationToken = default)
//     {
//         try
//         {
//             var filter = Builders<BsonDocument>.Filter.Eq("login", login);
//             var document = await CollectionUsers.Find(filter).FirstOrDefaultAsync();
//             
//             // return document == null ? null : MapToUser(document);
//         }
//         catch (Exception ex)
//         {
//             throw new Exception($"Ошибка при поиске по логину: {ex.Message}");
//         }
//     }
//
//     public async Task<bool> UpdatePassword(Guid userId, PasswordHash newPasswordHash)
//     {
//         try
//         {
//             var filter = Builders<BsonDocument>.Filter.Eq("userId", userId.ToString());
//             var update = Builders<BsonDocument>.Update.Set("passwordHash", newPasswordHash.Value);
//             
//             var result = await CollectionUsers.UpdateOneAsync(filter, update);
//             return result.ModifiedCount > 0;
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine($"Ошибка обновления пароля: {ex.Message}");
//             return false;
//         }
//     }
//
//     // private static User MapToUser(BsonDocument document)
//     // {
//     //     // 1. Извлекаем данные для Value Objects
//     //     var login = new Login(document["login"].AsString);
//     //     var passwordHash = new PasswordHash(document["passwordHash"].AsString);
//     //     var role = Enum.Parse<UserRole>(document["role"].AsString);
//     //
//     //     // 2. Создаем объект через публичный конструктор (т.к. он у тебя есть)
//     //     var user = new User(login, passwordHash, role);
//     //
//     //     // 3. Устанавливаем Id через рефлексию
//     //     var idProperty = typeof(User).GetProperty("Id");
//     //     if (document.Contains("userId"))
//     //     {
//     //         var idValue = new UserId(Guid.Parse(document["userId"].AsString));
//     //         idProperty?.SetValue(user, idValue);
//     //     }
//     //
//     //     return user;
//     // }
// }