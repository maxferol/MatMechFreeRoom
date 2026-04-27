using MediatR;
using FreeRoom.backend.src.Application.DTOs;
using FreeRoom.backend.src.Domain.Interfaces;

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
                RoomNumber: b.RoomStaticId.Value,  // RoomStaticId.Value уже строка (например "612")
                LessonNumber: b.LessonNumber.Value,
                BookingDate: b.BookingDate.Value
            ))
            .ToList();
    }
}