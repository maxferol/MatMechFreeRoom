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
        // Получаем все записи
        var allBookings = await _roomDynamicRepository.GetAll();

        // Формируем словарь
        return allBookings
            .Where(b => b.BookingDate.Value.Date == request.Date.Date) // Фильтруем только по нужной дате
            .GroupBy(b => b.RoomStaticId.Value) // Группируем по номеру комнаты
            .ToDictionary(
                group => group.Key, // Ключ: "509"
                group => group
                    .Select(b => b.LessonNumber.Value) // Выбираем номера пар
                    .Distinct()                        // Убираем дубликаты
                    .OrderBy(n => n)                   // Сортируем (1, 2, 3...)
                    .ToList()
            );
    }
}