using Api.Utils;
using DotNetEnv;

using FluentValidation;
using Repositories.Core.AutoMapperConfig;
using Repositories.Core.Context;
using Repositories.Core.Validators;
using Api.Middlewares;
using StackExchange.Redis;
using TicketResell.Repositories.UnitOfWork;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
JsonUtils.UpdateJsonValue("ConnectionStrings:SQLServer", "appsettings.json", Environment.GetEnvironmentVariable("SQLServer"));





// Dbcontext configuration
builder.Services.AddDbContext<TicketResellManagementContext>();
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379"));

// Automapper configuration
builder.Services.AddAutoMapper(typeof(AutoMapperConfigProfile));

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IOrderDetailService, OrderDetailService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddSingleton<IServiceProvider>(provider => provider);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddValidatorsFromAssemblyContaining<UserValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<OrderValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<OrderDetailValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<CategoryValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<TicketValidator>();
builder.Services.AddScoped<Repositories.Core.Validators.IValidatorFactory, ValidatorFactory>();

builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();

var app = builder.Build();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
JsonUtils.UpdateJsonValue("ConnectionStrings:SQLServer", "appsettings.json", "default");
