using MediatR;
using FreeRoom.backend.src.Application.DTOs;
using FreeRoom.backend.src.Domain.Interfaces;

namespace FreeRoom.backend.src.Application.Users.Queries;

public class GetUserBookingsQueryHandler : IRequestHandler<GetUserBookingsQuery, List<UserBookingDto>>
{
    private readonly IRoomDynamicRepository _roomDynamicRepository;

    public GetUserBookingsQueryHandler(IRoomDynamicRepository roomDynamicRepository)
    {
        _roomDynamicRepository = roomDynamicRepository;
    }

    public async Task<List<UserBookingDto>> Handle(GetUserBookingsQuery request, CancellationToken cancellationToken)
    {
        var normalizedDate = request.Date.ToUniversalTime().Date;
        var userBookings = await _roomDynamicRepository.GetByUserAndDate(request.Login, normalizedDate);
        return userBookings
            .Select(b => new UserBookingDto(
                b.RoomStaticId.Value, 
                b.LessonNumber.Value))
            .ToList();
    }
}