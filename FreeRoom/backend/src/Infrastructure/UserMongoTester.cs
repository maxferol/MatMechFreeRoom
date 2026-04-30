using System.Reflection;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Value_Object.User;
using FreeRoom.backend.src.Domain.Enum;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using FreeRoom.backend.src.Infrastructure.UserStorage;
using MongoDB.Bson;

namespace FreeRoom.backend.src.Infrastructure;

public class UserMongoTester
{
    private readonly UserMongoDB _repository;

    public UserMongoTester(string connectionString, string dbName)
    {
        _repository = new UserMongoDB(connectionString, dbName);
    }

    public async Task RunUserTest()
    {
        Console.WriteLine("\n>>> НАЧАЛО ТЕСТИРОВАНИЯ UserMongoDB <<<");

        try
        {
            // 1. Создание данных
            // var login = Login.CreateLogin("Иван", "Иванов", "ivan_test_" + Guid.NewGuid().ToString().Substring(0, 5));
            var login = Login.CreateLogin("Иван", "Иванов", "ivan_test_18956");
            var passwordHash = PasswordHash.CreateHash("super_secret_hash_123");
            var role = UserRole.User;

            // Создаем объект User для теста
            var userCtor = typeof(User).GetConstructor(
                BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public,
                null,
                new[] { typeof(Login), typeof(PasswordHash), typeof(UserRole) },
                null);

            var testUser = (User)userCtor!.Invoke(new object[] { login, passwordHash, role });

            var userIdValue = Guid.NewGuid();
            typeof(User).GetProperty("Id")?.SetValue(testUser, new UserId(userIdValue));

            // 2. Тест: Создание
            Console.WriteLine($"[TEST 1]: Создание пользователя {login.LoginUser}...");
            await _repository.CreateUser(testUser);
            Console.WriteLine("✓ Успешно сохранено.");

            // 3. Тест: Поиск по логину
            Console.WriteLine("[TEST 2]: Поиск по логину...");
            var foundByLogin = await _repository.GetByLogin(login.LoginUser);
            if (foundByLogin != null)
                Console.WriteLine($"✓ Найдено! Login: {foundByLogin.Login.LoginUser}");
            else
                throw new Exception("Пользователь не найден по логину.");

            // 4. Тест: Поиск по ID
            Console.WriteLine("[TEST 3]: Поиск по ID...");
            var foundById = await _repository.GetById(userIdValue);
            if (foundById != null && foundById.Id.Value == userIdValue)
                Console.WriteLine($"✓ Найдено! ID совпадает.");
            else
                throw new Exception("Пользователь не найден по ID.");

            Console.WriteLine("\n>>> ВСЕ ТЕСТЫ UserMongoDB ПРОЙДЕНЫ УСПЕШНО <<<");
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"\nОШИБКА ТЕСТЕРА: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
            Console.ResetColor();
        }
    }
}