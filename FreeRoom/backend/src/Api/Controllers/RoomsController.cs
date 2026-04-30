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
        try
        {
            // Парсим дату
            if (!DateTime.TryParse(date, out var parsedDate))
            {
                return BadRequest(new { error = "Неверный формат даты. Используйте YYYY-MM-DD" });
            }

            // Отправляем запрос через MediatR
            var busyRooms = await _mediator.Send(new GetBusyRoomsQuery(parsedDate));
            
            return Ok(new
            {
                success = true,
                date = date,
                busyRooms = busyRooms.Select(b => b.RoomNumber).ToList()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }


[HttpGet("test")]
public IActionResult Test()
{
    return Ok(new { message = "Бэкенд доступен", timestamp = DateTime.Now });
}
}
