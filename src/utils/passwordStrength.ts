export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {
      score: 0,
      label: 'Too weak',
      color: 'hsl(0 70% 55%)',
      suggestions: ['Enter a password']
    };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');

  // Uppercase check
  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('Include uppercase letters');

  // Lowercase check
  if (/[a-z]/.test(password)) score++;
  else suggestions.push('Include lowercase letters');

  // Number check
  if (/\d/.test(password)) score++;
  else suggestions.push('Include numbers');

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else suggestions.push('Include special characters');

  // Length bonus
  if (password.length >= 12) score++;

  // Determine strength
  let label: string;
  let color: string;

  if (score === 0) {
    label = 'Too weak';
    color = 'hsl(0 70% 55%)';
  } else if (score <= 2) {
    label = 'Weak';
    color = 'hsl(15 85% 55%)';
  } else if (score <= 3) {
    label = 'Fair';
    color = 'hsl(35 85% 52%)';
  } else if (score <= 4) {
    label = 'Good';
    color = 'hsl(60 85% 45%)';
  } else {
    label = 'Strong';
    color = 'hsl(140 70% 48%)';
  }

  return { score: Math.min(score, 5), label, color, suggestions };
};