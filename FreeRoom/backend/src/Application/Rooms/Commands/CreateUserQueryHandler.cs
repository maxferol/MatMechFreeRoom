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
            // 1. Проверяем, не занят ли логин
            var existingUser = await _userRepository.GetByLogin(request.Data.Login);
            if (existingUser != null)
            {
                return null; // Логин уже существует
            }

            // 2. Создаем Value Objects
            var login = Login.CreateLogin(
                request.Data.FirstName, 
                request.Data.SecondName, 
                request.Data.Login
            );
            
            var passwordHash = PasswordHash.CreateHash(request.Data.Password);
            var role = Enum.Parse<UserRole>(request.Data.Role, true);

            // 3. Создаем доменную сущность User через рефлексию
            var userCtor = typeof(User).GetConstructor(
                BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public,
                null,
                new[] { typeof(Login), typeof(PasswordHash), typeof(UserRole) },
                null);

            if (userCtor == null) throw new Exception("Конструктор User не найден");

            var newUser = (User)userCtor.Invoke(new object[] { login, passwordHash, role });

            // 4. Генерируем и устанавливаем ID
            var newUserId = Guid.NewGuid();
            var idProperty = typeof(User).GetProperty("Id");
            idProperty?.SetValue(newUser, new UserId(newUserId));

            // 5. Сохраняем в MongoDB
            await _userRepository.CreateUser(newUser);

            return newUserId;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при регистрации пользователя: {ex.Message}");
            return null;
        }
    }
}