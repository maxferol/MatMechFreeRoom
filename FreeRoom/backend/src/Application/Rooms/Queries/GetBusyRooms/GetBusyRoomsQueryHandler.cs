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
        // Получаем все записи бронирования
        var allBookings = await _roomDynamicRepository.GetAll();

        // Фильтруем по дате и номеру пары, как требует фронтенд
        return allBookings
            .Where(b => b.BookingDate.Value.Date == request.Date.Date && 
                        b.LessonNumber.Value == request.PairNumber)
            .Select(b => new BusyRoomDto(
                RoomNumber: b.RoomStaticId.Value.ToString(), 
                LessonNumber: b.LessonNumber.Value,
                BookingDate: b.BookingDate.Value
            ))
            .ToList();
    }
}