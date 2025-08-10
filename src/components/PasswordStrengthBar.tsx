import React from 'react';
import { calculatePasswordStrength } from '@/utils/passwordStrength';

interface PasswordStrengthBarProps {
  password: string;
  showSuggestions?: boolean;
}

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ 
  password, 
  showSuggestions = true 
}) => {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className="text-xs font-medium" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${(strength.score / 5) * 100}%`,
              backgroundColor: strength.color
            }}
          />
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && strength.suggestions.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {strength.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center space-x-1">
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};