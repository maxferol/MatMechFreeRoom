// using Microsoft.AspNetCore.Mvc;
// using FreeRoom.backend.src.Domain.Interfaces;
// using FreeRoom.backend.src.Domain.Enities;
// using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
// using FreeRoom.backend.src.Infrastructure.GetEntitiesId;

// namespace FreeRoom.backend.src.API.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class RoomsController
// {
//     private readonly IRoomDynamicRepository _roomDynamicRepository;
//     private readonly IRoomStaticRepository _roomStaticRepository; // нужно создать

//     public RoomsController(
//         IRoomDynamicRepository roomDynamicRepository,
//         IRoomStaticRepository roomStaticRepository)
//     {
//         _roomDynamicRepository = roomDynamicRepository;
//         _roomStaticRepository = roomStaticRepository;
//     }

//     /// <summary>
//     /// Получить список занятых аудиторий по дате и паре
//     /// </summary>
//     /// <param name="date">Дата в формате YYYY-MM-DD</param>
//     /// <param name="pair">Номер пары (1-6)</param>
//     /// <returns>Список номеров занятых аудиторий</returns>
//     [HttpGet("busy")]
//     public async Task<IActionResult> GetBusyRooms([FromQuery] string date, [FromQuery] int pair)
//     {
//         try
//         {
//             // Парсим дату
//             if (!DateTime.TryParse(date, out var parsedDate))
//             {
//                 return BadRequest(new { error = "Неверный формат даты. Используйте YYYY-MM-DD" });
//             }

//             // Проверяем номер пары
//             if (pair < 1 || pair > 6)
//             {
//                 return BadRequest(new { error = "Номер пары должен быть от 1 до 6" });
//             }

//             // Получаем все бронирования
//             var allBookings = await _roomDynamicRepository.GetAll();
            
//             // Фильтруем по дате и паре
//             var busyBookings = allBookings.Where(b => 
//                 b.BookingDate.Value.Date == parsedDate.Date && 
//                 b.LessonNumber.Value == pair);
            
//             // Получаем ID комнат, которые заняты
//             var busyRoomStaticIds = busyBookings.Select(b => b.RoomStaticId).ToList();
            
//             // Получаем номера комнат (нужно реализовать метод в RoomStaticRepository)
//             var busyRoomNumbers = await _roomStaticRepository.GetRoomNumbersByIds(busyRoomStaticIds);
            
//             return Ok(new
//             {
//                 success = true,
//                 date = date,
//                 pair = pair,
//                 busyRooms = busyRoomNumbers
//             });
//         }
//         catch (Exception ex)
//         {
//             return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
//         }
//     }

//     /// <summary>
//     /// Проверить, свободна ли конкретная аудитория
//     /// </summary>
//     [HttpGet("{roomNumber}/status")]
//     public async Task<IActionResult> GetRoomStatus(string roomNumber, [FromQuery] string date, [FromQuery] int pair)
//     {
//         try
//         {
//             if (!DateTime.TryParse(date, out var parsedDate))
//             {
//                 return BadRequest(new { error = "Неверный формат даты" });
//             }

//             // Получаем статическую информацию о комнате
//             var roomStatic = await _roomStaticRepository.GetByRoomNumber(roomNumber);
//             if (roomStatic == null)
//             {
//                 return NotFound(new { error = $"Аудитория {roomNumber} не найдена" });
//             }

//             // Проверяем, есть ли бронь
//             var allBookings = await _roomDynamicRepository.GetAll();
//             var isBusy = allBookings.Any(b => 
//                 b.RoomStaticId.Value == roomStatic.Id.Value &&
//                 b.BookingDate.Value.Date == parsedDate.Date && 
//                 b.LessonNumber.Value == pair);

//             return Ok(new
//             {
//                 roomNumber = roomNumber,
//                 date = date,
//                 pair = pair,
//                 isBusy = isBusy,
//                 status = isBusy ? "busy" : "free"
//             });
//         }
//         catch (Exception ex)
//         {
//             return StatusCode(500, new { error = ex.Message });
//         }
//     }
// }