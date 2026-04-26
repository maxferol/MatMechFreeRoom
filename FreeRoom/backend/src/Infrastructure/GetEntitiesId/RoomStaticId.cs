namespace FreeRoom.backend.src.Infrastructure.GetEntitiesId;

public record RoomStaticId(Guid Value)
{
    public static RoomStaticId New() => new RoomStaticId(Guid.NewGuid());
    public override string ToString() => Value.ToString();
}