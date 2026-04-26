namespace FreeRoom.backend.src.Infrastructure.GetEntitiesId;

public record UserId(Guid Value)
{
    public static UserId New() => new UserId(Guid.NewGuid());
    public override string ToString() => Value.ToString();
}