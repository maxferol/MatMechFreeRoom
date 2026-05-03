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
            
            Console.WriteLine($"=== БРОНИРОВАНИЕ ===");
            Console.WriteLine($"RoomNumber: {dto.RoomNumber}");
            Console.WriteLine($"Login: {dto.Login}");
            Console.WriteLine($"Date: {dto.Date}");
            Console.WriteLine($"LessonNumber: {dto.LessonNumber}");
            
            // Проверяем, существует ли пользователь
            var user = await _userRepository.GetByLogin(dto.Login);
            if (user == null)
            {
                Console.WriteLine($"Пользователь {dto.Login} не найден");
                return false;
            }
            
            // Получаем UserId из найденного пользователя
            var userId = user.Id;
            
            
            // Создаем новое бронирование
            var booking = new RoomDynamic(
                new RoomStaticId(dto.RoomNumber),
                userId,
                new LessonNumber(dto.LessonNumber),
                new BookingDate(dto.Date)
            );
            
            var result = await _roomRepository.CreateRoomDynamic(booking);
            Console.WriteLine(result != null ? "Бронирование успешно создано" : "Ошибка при создании бронирования");
            
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