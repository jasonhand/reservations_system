const Joi = require('joi');

const reservationSchema = Joi.object({
  siteId: Joi.string().required().messages({
    'string.empty': 'Site ID is required',
    'any.required': 'Site ID is required'
  }),
  
  checkIn: Joi.date().required().messages({
    'date.base': 'Check-in date must be a valid date',
    'date.format': 'Check-in date must be in format YYYY-MM-DD',
    'date.min': 'Check-in date cannot be in the past',
    'any.required': 'Check-in date is required'
  }),
  
  checkOut: Joi.date().greater(Joi.ref('checkIn')).required().messages({
    'date.base': 'Check-out date must be a valid date',
    'date.format': 'Check-out date must be in format YYYY-MM-DD',
    'date.greater': 'Check-out date must be after check-in date',
    'any.required': 'Check-out date is required'
  }),
  
  guests: Joi.number().integer().min(1).max(20).required().messages({
    'number.base': 'Number of guests must be a number',
    'number.integer': 'Number of guests must be a whole number',
    'number.min': 'At least 1 guest is required',
    'number.max': 'Maximum 20 guests allowed',
    'any.required': 'Number of guests is required'
  }),
  
  guestName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Guest name is required',
    'string.min': 'Guest name must be at least 2 characters',
    'string.max': 'Guest name cannot exceed 100 characters',
    'any.required': 'Guest name is required'
  }),
  
  guestEmail: Joi.string().email().lowercase().required().messages({
    'string.empty': 'Email address is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email address is required'
  }),
  
  guestPhone: Joi.string().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please provide a valid phone number',
    'any.required': 'Phone number is required'
  }),
  
  specialRequests: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Special requests cannot exceed 500 characters'
  })
});

function validateReservation(data) {
  const { error, value } = reservationSchema.validate(data, {
    abortEarly: false, // Return all errors, not just the first one
    stripUnknown: true // Remove unknown fields
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return {
      isValid: false,
      errors,
      data: null
    };
  }
  
  // Additional custom validations
  const customErrors = [];
  
  // Check if stay is reasonable (between 1 and 30 nights)
  const checkIn = new Date(value.checkIn);
  const checkOut = new Date(value.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  // Check if check-in date is not in the past (allow same day)
  // Use date strings for comparison to avoid timezone issues
  const todayString = new Date().toISOString().split('T')[0];
  const checkInString = value.checkIn;
  
  if (checkInString < todayString) {
    customErrors.push({
      field: 'checkIn',
      message: 'Check-in date cannot be in the past'
    });
  }
  
  if (nights < 1) {
    customErrors.push({
      field: 'checkOut',
      message: 'Minimum stay is 1 night'
    });
  }
  
  if (nights > 30) {
    customErrors.push({
      field: 'checkOut',
      message: 'Maximum stay is 30 nights'
    });
  }
  
  // Check if booking is not too far in advance (e.g., 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (checkIn > oneYearFromNow) {
    customErrors.push({
      field: 'checkIn',
      message: 'Bookings cannot be made more than 1 year in advance'
    });
  }
  
  if (customErrors.length > 0) {
    return {
      isValid: false,
      errors: customErrors,
      data: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    data: value
  };
}

function validateEmail(email) {
  const emailSchema = Joi.string().email().required();
  const { error } = emailSchema.validate(email);
  return !error;
}

function validateDateRange(startDate, endDate) {
  const dateRangeSchema = Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
  });
  
  const { error } = dateRangeSchema.validate({ startDate, endDate });
  return !error;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
}

module.exports = {
  validateReservation,
  validateEmail,
  validateDateRange,
  sanitizeInput
};