using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FreeRoom.backend.src.Infrastructure;

public class FreeRoomDbContext(DbContextOptions<FreeRoomDbContext> options) : DbContext(options)
{
    public DbSet<RoomDynamic> RoomDynamics => Set<RoomDynamic>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var room = modelBuilder.Entity<RoomDynamic>();
        room.ToTable("room_dynamics");
        room.HasKey(x => x.Id);

        room.Property(x => x.Id)
            .HasColumnName("room_dynamic_id")
            .HasConversion(new ValueConverter<RoomDynamicId, Guid>(
                id => id.Value,
                value => new RoomDynamicId(value)))
            .ValueGeneratedNever();
        room.Property(x => x.RoomStaticId)
            .HasColumnName("room_static_id")
            .HasConversion(new ValueConverter<RoomStaticId, Guid>(
                id => id.Value,
                value => new RoomStaticId(value)));
        room.Property(x => x.UserId)
            .HasColumnName("user_id")
            .HasConversion(new ValueConverter<UserId, Guid>(
                id => id.Value,
                value => new UserId(value)));
        room.Property(x => x.LessonNumber)
            .HasColumnName("lesson_number")
            .HasConversion(new ValueConverter<LessonNumber, int>(
                lesson => lesson.Value,
                value => new LessonNumber(value)));
        room.Property(x => x.BookingDate)
            .HasColumnName("booking_date")
            .HasColumnType("timestamp without time zone")
            .HasConversion(new ValueConverter<BookingDate, DateTime>(
                date => DateTime.SpecifyKind(date.Value, DateTimeKind.Unspecified),
                value => new BookingDate(DateTime.SpecifyKind(value, DateTimeKind.Unspecified))));
        room.Property<int>("ViewCount")
            .HasColumnName("view_count")
            .HasDefaultValue(0);
    }
}
