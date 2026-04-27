namespace FreeRoom.backend.src.Infrastructure.GetEntitiesId;

public class RoomStaticId
{
    public Guid Value { get; }

    public RoomStaticId(Guid value)
    {
        // Можно добавить проверку на пустой Guid, если нужно
        if (value == Guid.Empty)
            throw new ArgumentException("Guid не может быть пустым", nameof(value));
            
        Value = value;
    }

    public static RoomStaticId New() => new RoomStaticId(Guid.NewGuid());

    public override string ToString() => Value.ToString();
}