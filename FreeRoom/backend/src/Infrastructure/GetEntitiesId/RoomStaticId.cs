namespace FreeRoom.backend.src.Infrastructure.GetEntitiesId;

public class RoomStaticId
{
    public string Value { get; }

    public RoomStaticId(string? value)
    {
        // Можно добавить проверку на пустой Guid, если нужно
        if (value == null)
            throw new ArgumentException("Guid не может быть пустым", nameof(value));
            
        Value = value;
    }

    // public static RoomStaticId New() => new RoomStaticId(Guid.NewGuid());
    public override string ToString() => Value.ToString();
}