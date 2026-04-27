using MediatR;
using FreeRoom.backend.src.Application.DTOs;

namespace FreeRoom.backend.src.Application.Rooms.Queries.GetBusyRooms;

public record GetBusyRoomsQuery(DateTime Date, int PairNumber) : IRequest<List<BusyRoomDto>>;