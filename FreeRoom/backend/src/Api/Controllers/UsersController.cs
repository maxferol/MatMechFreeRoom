using Microsoft.AspNetCore.Mvc;
using MediatR;
using FreeRoom.backend.src.Application.DTOs;
using FreeRoom.backend.src.Application.Users.Queries;

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