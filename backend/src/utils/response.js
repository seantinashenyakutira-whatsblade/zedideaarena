function success(res, data, message = null, statusCode = 200) {
  const body = { success: true };
  if (data !== undefined && data !== null) body.data = data;
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

function created(res, data, message = 'Created successfully') {
  return success(res, data, message, 201);
}

function error(res, message, statusCode = 500, details = null) {
  const body = { success: false, error: message };
  if (details && process.env.NODE_ENV === 'development') body.details = details;
  return res.status(statusCode).json(body);
}

function badRequest(res, message = 'Bad request') {
  return error(res, message, 400);
}

function notFound(res, message = 'Resource not found') {
  return error(res, message, 404);
}

function unauthorized(res, message = 'Unauthorized') {
  return error(res, message, 401);
}

function forbidden(res, message = 'Forbidden') {
  return error(res, message, 403);
}

module.exports = { success, created, error, badRequest, notFound, unauthorized, forbidden };
