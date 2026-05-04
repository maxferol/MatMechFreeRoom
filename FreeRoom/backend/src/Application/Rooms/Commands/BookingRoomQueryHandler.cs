using MediatR;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using FreeRoom.backend.src.Infrastructure.UserStorage;

namespace FreeRoom.backend.src.Application.Rooms.Commands.BookRoom;

public class BookingRoomQueryHandler : IRequestHandler<BookingRoomQuery, bool>
{
    private readonly IRoomDynamicRepository _roomRepository;
    private readonly UserMongoDB _userRepository;

    public BookingRoomQueryHandler(IRoomDynamicRepository roomRepository, UserMongoDB userRepository)
    {
        _roomRepository = roomRepository;
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(BookingRoomQuery request, CancellationToken cancellationToken)
{
    try
    {
        var dto = request.BookingDto;
        
        // Нормализуем дату - берем только дату без времени и без смещения
        // Если дата пришла в формате "2026-05-04", она может быть интерпретирована как UTC
        // Нужно создать дату в локальной временной зоне
        var normalizedDate = dto.Date.Date;
        
        Console.WriteLine($"=== БРОНИРОВАНИЕ ===");
        Console.WriteLine($"RoomNumber: {dto.RoomNumber}");
        Console.WriteLine($"Login: {dto.Login}");
        Console.WriteLine($"Исходная дата: {dto.Date}");
        Console.WriteLine($"Нормализованная дата: {normalizedDate}");
        Console.WriteLine($"LessonNumber: {dto.LessonNumber}");
        
        // Проверяем, существует ли пользователь
        var user = await _userRepository.GetByLogin(dto.Login);
        if (user == null)
        {
            Console.WriteLine($"Пользователь {dto.Login} не найден");
            return false;
        }
        
        var userId = user.Id;
        
        // ПРОВЕРКА: не занята ли аудитория
        Console.WriteLine("Проверка: не занята ли аудитория...");
        
        var allBookings = await _roomRepository.GetAll();
        
        var existingBooking = allBookings
            .Where(b => b.RoomStaticId != null && b.BookingDate != null && b.LessonNumber != null)
            .FirstOrDefault(b => 
                b.RoomStaticId.Value == dto.RoomNumber && 
                b.BookingDate.Value.Date == normalizedDate && // Сравниваем только дату
                b.LessonNumber.Value == dto.LessonNumber);
        
        if (existingBooking != null)
        {
            Console.WriteLine($"❌ Аудитория {dto.RoomNumber} уже занята на {dto.LessonNumber} пару {normalizedDate:yyyy-MM-dd}");
            return false;
        }
        
        Console.WriteLine("Аудитория свободна, можно бронировать");
        
        // СОЗДАЕМ БРОНИРОВАНИЕ С НОРМАЛИЗОВАННОЙ ДАТОЙ
        var booking = new RoomDynamic(
            new RoomStaticId(dto.RoomNumber),
            userId,
            new LessonNumber(dto.LessonNumber),
            new BookingDate(normalizedDate) // Используем нормализованную дату
        );
        
        var result = await _roomRepository.CreateRoomDynamic(booking);
        Console.WriteLine(result != null ? "✅ Бронирование успешно создано" : "❌ Ошибка при создании бронирования");
        
        return result != null;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Ошибка в BookingRoomQueryHandler: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return false;
    }
}
}