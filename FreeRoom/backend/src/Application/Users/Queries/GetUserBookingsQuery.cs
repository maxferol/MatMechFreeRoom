using MediatR;
using FreeRoom.backend.src.Application.DTOs;

namespace FreeRoom.backend.src.Application.Users.Queries;

public record GetUserBookingsQuery(string Login, DateTime Date) : IRequest<List<UserBookingDto>>;