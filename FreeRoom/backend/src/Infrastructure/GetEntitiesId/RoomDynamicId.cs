namespace FreeRoom.backend.src.Infrastructure.GetEntitiesId;

public record RoomDynamicId(Guid Value)
{
    public static RoomDynamicId New() => new RoomDynamicId(Guid.NewGuid());
    public override string ToString() => Value.ToString();
}