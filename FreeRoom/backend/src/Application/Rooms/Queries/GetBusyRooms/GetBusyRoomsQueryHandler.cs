using MediatR;
using FreeRoom.backend.src.Domain.Interfaces;

namespace FreeRoom.backend.src.Application.Rooms.Queries.GetBusyRooms;

public class GetBusyRoomsQueryHandler : IRequestHandler<GetBusyRoomsQuery, Dictionary<string, List<int>>>
{
    private readonly IRoomDynamicRepository _roomDynamicRepository;

    public GetBusyRoomsQueryHandler(IRoomDynamicRepository roomDynamicRepository)
    {
        _roomDynamicRepository = roomDynamicRepository;
    }

    public async Task<Dictionary<string, List<int>>> Handle(GetBusyRoomsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Нормализуем дату - берем только дату без времени
            var targetDate = request.Date.Date;
            Console.WriteLine($"GetBusyRoomsQueryHandler: запрос для даты {targetDate}");
            
            // Получаем все бронирования
            var allBookings = await _roomDynamicRepository.GetAll();
            Console.WriteLine($"Всего бронирований в БД: {allBookings.Count}");
            
            // Фильтруем по дате и группируем по комнатам
            var result = allBookings
                .Where(b => b.RoomStaticId != null && b.BookingDate != null)
                .Where(b => b.BookingDate.Value.Date == targetDate) // ВАЖНО: фильтр по дате
                .GroupBy(b => b.RoomStaticId.Value)
                .ToDictionary(
                    group => group.Key.ToString(),
                    group => group
                        .Select(b => b.LessonNumber.Value)
                        .Distinct()
                        .OrderBy(n => n)
                        .ToList()
                );
            
            Console.WriteLine($"Найдено комнат с бронированиями для даты {targetDate}: {result.Count}");
            
            // Выводим результат для отладки
            foreach (var kvp in result) 
            {
                Console.WriteLine($"  Комната {kvp.Key}: пары {string.Join(", ", kvp.Value)}");
            }
            
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка в GetBusyRoomsQueryHandler: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return new Dictionary<string, List<int>>();
        }
    }
}