FROM mcr.microsoft.com/dotnet/sdk:7.0-alpine AS build
WORKDIR /src

COPY ["LiventCord.csproj", "./"]
COPY ["Properties", "./Properties"]
RUN dotnet restore "LiventCord.csproj"

WORKDIR /app
RUN mkdir -p /app/wwwroot \
    && apk add --no-cache git \
    && git clone https://github.com/liventcord/LiventCordFrontend.git /app/wwwroot \
    && ls -l /app/wwwroot  

COPY . .
RUN dotnet build "LiventCord.csproj" -c Release -o /app/build

FROM build AS publish
COPY ["Properties", "./Properties"]
RUN dotnet publish "LiventCord.csproj" -c Release -o /app/publish \
  --runtime alpine-x64 \
  --self-contained true \
  /p:PublishTrimmed=true \
  /p:PublishSingleFile=true

FROM mcr.microsoft.com/dotnet/runtime-deps:7.0-alpine AS final

RUN adduser --disabled-password \
  --home /app \
  --gecos '' dotnetuser && chown -R dotnetuser /app

USER dotnetuser
WORKDIR /app

COPY --from=publish /app/publish .
COPY --from=publish /src/Properties /app/Properties

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["./LiventCord"]