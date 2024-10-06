using MyPostgresApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("LocalConnection")));

// Add authentication services
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.ExpireTimeSpan = TimeSpan.FromDays(7); // Cookie expiration
        options.SlidingExpiration = true; // Refresh cookie on activity
        options.LoginPath = "/auth/login"; // Redirect path for unauthorized users
    });
builder.Services.AddMemoryCache();

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor(); // Required for HttpContext access in controllers

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication(); // Enable authentication middleware
app.UseAuthorization();
app.UseStaticFiles();

void MapRoute(string path, string fileName, string contentType)
{
    app.MapGet(path, async context =>
    {
        var filePath = Path.Combine(app.Environment.WebRootPath, fileName);
        context.Response.ContentType = contentType;
        await context.Response.SendFileAsync(filePath);
    });
}

MapRoute("/", "newdc.html", "text/html");
MapRoute("/download", "download.html", "text/html");
MapRoute("/login", "login.html", "text/html");
MapRoute("/register", "register.html", "text/html");
MapRoute("/w/loader/loader.js", "static/js/loader.js", "application/javascript");

app.MapFallback(async context =>
{
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
    await context.Response.SendFileAsync(filePath);
});

app.MapControllers();
app.Run();
