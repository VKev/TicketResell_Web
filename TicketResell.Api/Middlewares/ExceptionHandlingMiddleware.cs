using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;


namespace Api.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred: {ex.Message}");
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception ex, string message = "An internal server error occurred.")
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var innerException = ex.InnerException;
            var detailedMessage = innerException != null ? innerException.Message : ex.Message;
            var errorResponse = new
            {
                StatusCode = context.Response.StatusCode,
                Message = message,
                Detail = detailedMessage
            };

            var jsonResponse = JsonConvert.SerializeObject(errorResponse);
            return context.Response.WriteAsync(jsonResponse);
        }
    }
}