using MediatR;
using FreeRoom.backend.src.Application.DTOs;
using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Domain.Enities; // ДОБАВИТЬ
using FreeRoom.backend.src.Infrastructure.GetEntitiesId; // ДОБАВИТЬ

namespace FreeRoom.backend.src.Application.Rooms.Queries.GetBusyRooms;

public class GetBusyRoomsQueryHandler : IRequestHandler<GetBusyRoomsQuery, List<BusyRoomDto>>
{
    private readonly IRoomDynamicRepository _roomDynamicRepository;

    public GetBusyRoomsQueryHandler(IRoomDynamicRepository roomDynamicRepository)
    {
        _roomDynamicRepository = roomDynamicRepository;
    }

    public async Task<List<BusyRoomDto>> Handle(GetBusyRoomsQuery request, CancellationToken cancellationToken)
    {
        var allBookings = await _roomDynamicRepository.GetAll();

        return allBookings
            .Where(b => b.BookingDate.Value.Date == request.Date.Date && 
                        b.LessonNumber.Value == request.PairNumber)
            .Select(b => new BusyRoomDto(
                // Используем переопределенный ToString(), чтобы получить Guid строкой
                RoomNumber: b.RoomStaticId.Value, 
                LessonNumber: b.LessonNumber.Value,
                BookingDate: b.BookingDate.Value
            ))
            .ToList();
    }
}