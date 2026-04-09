using System;
using FreeRoom.backend.src.Domain.Value_Object.User;
using FreeRoom.backend.src.Domain.Enum;

namespace FreeRoom.backend.src.Domain.Enities;

public class User
{
    private Login login;
    private PasswordHash password;
    private UserRole role;

    public static void Create(Login login, PasswordHash password, UserRole role)
    {
        
    }
}