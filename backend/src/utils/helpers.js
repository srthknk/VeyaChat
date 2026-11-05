// Debounce utility for draft updates
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Response formatter
export const successResponse = (data, message = 'Success', statusCode = 200) => ({
  statusCode,
  success: true,
  message,
  data,
});

export const errorResponse = (message = 'Error', statusCode = 500, error = null) => ({
  statusCode,
  success: false,
  message,
  error,
});

// Validate MongoDB ObjectId
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
