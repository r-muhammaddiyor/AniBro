export const notFoundHandler = (request, response) => {
  response.status(404).json({ message: `Route not found: ${request.originalUrl}` });
};

export const errorHandler = (error, _request, response, _next) => {
  console.error(error);

  if (response.headersSent) {
    return;
  }

  response.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
    details: error.details || undefined
  });
};
