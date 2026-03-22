FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY SurveyApp.sln .
COPY src/SurveyApp.Core/SurveyApp.Core.csproj src/SurveyApp.Core/
COPY src/SurveyApp.Application/SurveyApp.Application.csproj src/SurveyApp.Application/
COPY src/SurveyApp.Infrastructure/SurveyApp.Infrastructure.csproj src/SurveyApp.Infrastructure/
COPY src/SurveyApp.API/SurveyApp.API.csproj src/SurveyApp.API/

# Restore
RUN dotnet restore

# Copy everything and build
COPY . .
RUN dotnet publish src/SurveyApp.API/SurveyApp.API.csproj -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5021
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5021

ENTRYPOINT ["dotnet", "SurveyApp.API.dll"]
