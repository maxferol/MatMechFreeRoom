FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

# ЗДЕСЬ ГЛАВНОЕ ИСПРАВЛЕНИЕ - FreeRoom.dll вместо FreeRoom.backend.dll
ENTRYPOINT ["dotnet", "FreeRoom.dll"]