# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY anDora.Api/anDora.Api.csproj anDora.Api/
RUN dotnet restore anDora.Api/anDora.Api.csproj

COPY anDora.Api/ anDora.Api/
WORKDIR /src/anDora.Api
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
COPY anDora.Api/appsettings.Production.json ./appsettings.Production.json

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "anDora.Api.dll"]
