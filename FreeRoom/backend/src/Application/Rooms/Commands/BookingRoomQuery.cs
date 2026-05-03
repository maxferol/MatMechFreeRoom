using MediatR;
using FreeRoom.backend.src.Application.DTOs;

namespace FreeRoom.backend.src.Application.Rooms.Commands;

public record BookingRoomQuery(CreateBookingDto BookingDto) : IRequest<bool>;