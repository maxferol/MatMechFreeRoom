using MediatR;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Domain.Value_Object.RoomStatic;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;

namespace FreeRoom.backend.src.Application.Rooms.Commands.BookRoom;

public class BookingRoomQueryHandler : IRequestHandler<BookingRoomQuery, bool>
{
    private readonly IRoomDynamicRepository _roomRepository;

    public BookingRoomQueryHandler(IRoomDynamicRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    public async Task<bool> Handle(BookingRoomQuery request, CancellationToken cancellationToken)
{
    var dto = request.BookingDto;

    // Пытаемся превратить логин в Guid. 
    // Если на фронте "admin" — это не Guid, используй UserId.FromLogin(dto.Login)
    var userGuid = Guid.TryParse(dto.Login, out var parsedGuid) 
                   ? parsedGuid 
                   : Guid.Empty; // Или логика генерации

    var booking = new RoomDynamic(
        new RoomStaticId(dto.RoomNumber),
        new UserId(userGuid), 
        new LessonNumber(dto.LessonNumber),
        new BookingDate(dto.Date)
    );

    var result = await _roomRepository.CreateRoomDynamic(booking);
    return result != null;
}
}