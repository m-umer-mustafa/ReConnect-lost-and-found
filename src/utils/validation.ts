// validation.ts

export const validateItemName = (name: string): string | null => {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Item name is required';
  }

  if (trimmed.length < 2) {
    return 'Item name must be at least 2 characters';
  }

  if (trimmed.length > 100) {
    return 'Item name must be less than 100 characters';
  }

  // Only allow letters, numbers, spaces, dashes, dots, commas, apostrophes, and &
  const specialChars = /[^a-zA-Z0-9\s\-.,'&]/g;
  if (specialChars.test(trimmed)) {
    return 'Item name should not contain special characters like @, #, $, %, etc.';
  }

  // Avoid names mostly made of numbers
  const numbers = /\d/g;
  const numberCount = (trimmed.match(numbers) || []).length;
  if (numberCount > trimmed.length / 2) {
    return 'Item name should not be mostly numbers';
  }

  return null;
};

export const validateDescription = (description: string): string | null => {
  const trimmed = description.trim();

  if (trimmed.length > 1000) {
    return 'Description must be less than 1000 characters';
  }

  // Allow most characters but block dangerous symbols
  const restrictedChars = /[@#$%^*<>{}\[\]|~`]/g;
  if (restrictedChars.test(trimmed)) {
    return 'Description should not contain special characters like @, #, $, %, *, <, >, etc.';
  }

  return null;
};

export const validateLocation = (location: string): string | null => {
  const trimmed = location.trim();

  if (!trimmed) {
    return 'Location is required';
  }

  if (trimmed.length < 3) {
    return 'Location must be at least 3 characters';
  }

  if (trimmed.length > 200) {
    return 'Location must be less than 200 characters';
  }

  // Allow letters, numbers, spaces, commas, periods, hyphens, slashes
  const restrictedChars = /[@#$%^*<>{}\[\]|~`]/g;
  if (restrictedChars.test(trimmed)) {
    return 'Location should not contain special characters like @, #, $, %, *, <, >, etc.';
  }

  return null;
};

export const validateDate = (date: string, type: 'past' | 'future' = 'past'): string | null => {
  if (!date) {
    return 'Date is required';
  }

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  if (type === 'past' && selectedDate > today) {
    return 'Date cannot be in the future';
  }

  if (type === 'future' && selectedDate < today) {
    return 'Date cannot be in the past';
  }

  return null;
};

// Remove restricted special characters
export const sanitizeInput = (input: string): string => {
  return input.replace(/[@#$%^*<>{}\[\]|~`]/g, '');
};

// Limit string length
export const enforceCharacterLimit = (input: string, limit: number): string => {
  return input.length > limit ? input.substring(0, limit) : input;
};
