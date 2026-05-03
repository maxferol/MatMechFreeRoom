using Microsoft.AspNetCore.Mvc;
using MediatR;
using FreeRoom.backend.src.Application.DTOs;
using FreeRoom.backend.src.Application.Users.Queries;
using FreeRoom.backend.src.Application.Users.Commands.CreateUser;
using FreeRoom.backend.src.Domain.Value_Object.User;
using FreeRoom.backend.src.Infrastructure.UserStorage;
using FreeRoom.backend.src.Application.Rooms.Commands;

namespace FreeRoom.backend.src.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly UserMongoDB _userRepository; // Экземпляр класса

    public UsersController(IMediator mediator, UserMongoDB userRepository)
    {
        _mediator = mediator;
        _userRepository = userRepository; // Сохраняем экземпляр
    }

    [HttpGet("{login}/bookings")]
    public async Task<IActionResult> GetUserBookings(string login, [FromQuery] DateTime date)
    {
        if (string.IsNullOrWhiteSpace(login))
            return BadRequest(new { error = "Логин пользователя не указан" });
        try
        {
            // Используем 'date', который пришел из параметров
            var result = await _mediator.Send(new GetUserBookingsQuery(login, date));
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Внутренняя ошибка сервера при получении бронирований" });
        }
    }

    [HttpPost("booking")]
    public async Task<IActionResult> BookingRoom([FromBody] CreateBookingDto dto)
    {
        var success = await _mediator.Send(new BookingRoomQuery(dto));
        
        if (!success)
            return Conflict(new { message = "Аудитория уже занята на это время" });

        return Ok(new { message = "Успешно забронировано" });
    }

    // Добавьте эти методы в UsersController.cs

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
    {
        try
        {
            Console.WriteLine("=== ПОЛУЧЕН ЗАПРОС НА РЕГИСТРАЦИЮ ===");
            Console.WriteLine($"Request: {System.Text.Json.JsonSerializer.Serialize(request)}");
        
            if (request == null)
            {
                Console.WriteLine("ОШИБКА: request is null");
                return BadRequest(new { message = "Неверный формат запроса" });
            }
        
            if (string.IsNullOrWhiteSpace(request.Login) || string.IsNullOrWhiteSpace(request.Password))
            {
                Console.WriteLine("ОШИБКА: Логин или пароль пустые");
                return BadRequest(new { message = "Логин и пароль обязательны" });
            }
        
            if (request.Password.Length < 6)
            {
                Console.WriteLine("ОШИБКА: Пароль слишком короткий");
                return BadRequest(new { message = "Пароль должен быть не менее 6 символов" });
            }
        
            Console.WriteLine("Отправка команды в MediatR...");
            var result = await _mediator.Send(new CreateUserCommand(request));
        
            if (result == null)
            {
                Console.WriteLine("ОШИБКА: Регистрация не удалась (result is null)");
                return Conflict(new { message = "Пользователь с таким логином уже существует" });
            }
        
            Console.WriteLine($"УСПЕХ: Пользователь зарегистрирован с ID {result}");
            return Ok(new { 
                userId = result, 
                login = request.Login,
                message = "Регистрация успешна" 
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"КРИТИЧЕСКАЯ ОШИБКА: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = "Внутренняя ошибка сервера", error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            Console.WriteLine($"=== ВХОД: {request?.Login} ===");
            
            if (string.IsNullOrWhiteSpace(request?.Login) || string.IsNullOrWhiteSpace(request?.Password))
                return BadRequest(new { message = "Логин и пароль обязательны" });
            
            // Поиск пользователя
            var user = await _userRepository.GetByLogin(request.Login);
            
            if (user == null)
            {
                Console.WriteLine($"Пользователь {request.Login} не найден");
                return Unauthorized(new { message = "Неверный логин или пароль" });
            }
            
            // Проверка пароля
            var isValidPassword = PasswordHash.Verify(request.Password, user.PasswordHash);
            
            if (!isValidPassword)
            {
                Console.WriteLine($"Неверный пароль для {request.Login}");
                return Unauthorized(new { message = "Неверный логин или пароль" });
            }
            
            // Генерация токена
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            
            Console.WriteLine($"Успешный вход: {request.Login}");
            
            return Ok(new 
            { 
                token = token,
                userId = user.Id.Value,
                login = user.Login.LoginUser,
                role = user.Role.ToString()
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка входа: {ex.Message}");
            return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
        }
    }
// DTO для запроса входа
    public class LoginRequest
    {
        public string Login { get; set; }
        public string Password { get; set; }
    }
}
