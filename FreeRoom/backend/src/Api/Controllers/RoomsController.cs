using Microsoft.AspNetCore.Mvc;
using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using MediatR;
using FreeRoom.backend.src.Application.Rooms.Queries.GetBusyRooms;

namespace FreeRoom.backend.src.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Получить список занятых аудиторий по дате и паре
    /// </summary>
    /// <param name="date">Дата в формате YYYY-MM-DD</param>
    /// <returns>Список номеров занятых аудиторий</returns>
    [HttpGet("busy")]
public async Task<IActionResult> GetBusyRooms([FromQuery] string date)
{
    if (!DateTime.TryParse(date, out var parsedDate))
        return BadRequest(new { error = "Неверный формат даты" });

    var schedule = await _mediator.Send(new GetBusyRoomsQuery(parsedDate));
    
    // Возвращаем словарь напрямую
    return Ok(schedule);
}


[HttpGet("test")]
public IActionResult Test()
{
    return Ok(new { message = "Бэкенд доступен", timestamp = DateTime.Now });
}
}
