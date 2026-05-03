using MediatR;
using System.Reflection;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Value_Object.User;
using FreeRoom.backend.src.Domain.Enum;
using FreeRoom.backend.src.Infrastructure.UserStorage;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using FreeRoom.backend.src.Application.DTOs;

namespace FreeRoom.backend.src.Application.Users.Commands.CreateUser;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid?>
{
    private readonly UserMongoDB _userRepository;

    public CreateUserCommandHandler(UserMongoDB userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Guid?> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"=== НАЧАЛО РЕГИСТРАЦИИ ===");
            Console.WriteLine($"Login: {request.Data?.Login}");
            Console.WriteLine($"Password: {request.Data?.Password}");
            Console.WriteLine($"FirstName: {request.Data?.FirstName}");
            Console.WriteLine($"SecondName: {request.Data?.SecondName}");
            Console.WriteLine($"Role: {request.Data?.Role}");
            
            // Проверка входных данных
            if (request.Data == null)
            {
                Console.WriteLine("ОШИБКА: request.Data is null");
                return null;
            }
            
            // 1. Проверяем, не занят ли логин
            Console.WriteLine("Проверка существующего пользователя...");
            var existingUser = await _userRepository.GetByLogin(request.Data.Login);
            if (existingUser != null)
            {
                Console.WriteLine($"Пользователь с логином {request.Data.Login} уже существует");
                return null;
            }
            Console.WriteLine("Пользователь не найден, можно регистрировать");

            // 2. Создаем Value Objects
            Console.WriteLine("Создание Login...");
            var login = Login.CreateLogin(
                request.Data.FirstName, 
                request.Data.SecondName, 
                request.Data.Login
            );
            Console.WriteLine("Login создан успешно");
            
            Console.WriteLine("Создание PasswordHash...");
            var passwordHash = PasswordHash.CreateHash(request.Data.Password);
            Console.WriteLine("PasswordHash создан успешно");
            
            Console.WriteLine("Парсинг роли...");
            var role = Enum.Parse<UserRole>(request.Data.Role, true);
            Console.WriteLine($"Роль: {role}");

            // 3. Создаем доменную сущность User через рефлексию
            Console.WriteLine("Поиск конструктора User...");
            var userCtor = typeof(User).GetConstructor(
                BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public,
                null,
                new[] { typeof(Login), typeof(PasswordHash), typeof(UserRole) },
                null);

            if (userCtor == null)
            {
                Console.WriteLine("ОШИБКА: Конструктор User не найден");
                throw new Exception("Конструктор User не найден");
            }
            Console.WriteLine("Конструктор найден, создаем пользователя...");

            var newUser = (User)userCtor.Invoke(new object[] { login, passwordHash, role });
            Console.WriteLine("Пользователь создан");

            // 4. Генерируем и устанавливаем ID
            var newUserId = Guid.NewGuid();
            Console.WriteLine($"Сгенерирован ID: {newUserId}");
            
            var idProperty = typeof(User).GetProperty("Id");
            idProperty?.SetValue(newUser, new UserId(newUserId));
            Console.WriteLine("ID установлен");

            // 5. Сохраняем в MongoDB
            Console.WriteLine("Сохранение в MongoDB...");
            await _userRepository.CreateUser(newUser);
            Console.WriteLine("Пользователь сохранен");

            Console.WriteLine($"=== РЕГИСТРАЦИЯ УСПЕШНА: {newUserId} ===");
            return newUserId;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== ОШИБКА ПРИ РЕГИСТРАЦИИ ===");
            Console.WriteLine($"Тип ошибки: {ex.GetType().Name}");
            Console.WriteLine($"Сообщение: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Внутренняя ошибка: {ex.InnerException.Message}");
            }
            return null;
        }
    }
}