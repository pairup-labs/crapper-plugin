const rateLimit = require('express-rate-limit');

// Create different rate limits for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limit
const generalLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Stricter limit for AI enhancement endpoints
const aiEnhancementLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  50, // limit each IP to 50 AI requests per windowMs
  'Too many AI enhancement requests from this IP, please try again later.'
);

// Very strict limit for bulk operations
const bulkOperationLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // limit each IP to 10 bulk requests per windowMs
  'Too many bulk operation requests from this IP, please try again later.'
);

module.exports = {
  generalLimit,
  aiEnhancementLimit,
  bulkOperationLimit
};
