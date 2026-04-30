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
        var allBookings = await _roomDynamicRepository.GetAll();
    
        return allBookings
            .Where(b => b.RoomStaticId != null)
            .GroupBy(b => b.RoomStaticId.Value) // Value может понадобиться, если RoomStaticId - Value Object
            .ToDictionary(
                group => group.Key.ToString(), // Преобразуем в строку
                group => group
                    .Select(b => b.LessonNumber.Value) // Берем Value из Value Object
                    .Distinct()
                    .OrderBy(n => n)
                    .ToList()
            );
    }
}