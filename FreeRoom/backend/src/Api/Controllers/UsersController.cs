using Microsoft.AspNetCore.Mvc;
using MediatR;
using FreeRoom.backend.src.Application.DTOs;
using FreeRoom.backend.src.Application.Users.Queries;
using FreeRoom.backend.src.Application.Rooms.Commands;

namespace FreeRoom.backend.src.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{login}/bookings")]
    public async Task<IActionResult> GetUserBookings(string login, [FromQuery] DateTime date)
    {
        if (string.IsNullOrWhiteSpace(login))
            return BadRequest(new { error = "Логин пользователя не указан" });
        try
        {
            // Используем 'date', который пришел из параметров
            var result = await _mediator.Send(new GetUserBookingsQuery(login, date));
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Внутренняя ошибка сервера при получении бронирований" });
        }
    }

    [HttpPost("booking")]
    public async Task<IActionResult> BookingRoom([FromBody] CreateBookingDto dto)
    {
        var success = await _mediator.Send(new BookingRoomQuery(dto));
        
        if (!success)
            return Conflict(new { message = "Аудитория уже занята на это время" });

        return Ok(new { message = "Успешно забронировано" });
    }

    // [HttpPost("register")]
    // public async Task<IActionResult> Register([FromBody] CreateUserDto createUserDto)
    // {
    //     try 
    //     {
    //         var result = await _mediator.Send(new CreateUserCommand(createUserDto));
    //         if (result == null)
    //             return Conflict(new { message = "Пользователь с таким логином уже существует" });

    //         return Ok(result);
    //     }
    //     catch (ArgumentException ex)
    //     {
    //         return BadRequest(new { error = ex.Message });
    //     }
    // }
}