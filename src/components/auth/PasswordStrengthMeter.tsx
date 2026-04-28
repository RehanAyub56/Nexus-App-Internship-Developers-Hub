import React from 'react';

interface Props { password: string; }

export const PasswordStrengthMeter: React.FC<Props> = ({ password }) => {
  const getStrength = (pwd: string) => {
    let points = 0;
    if (pwd.length > 7) points++;
    if (/[A-Z]/.test(pwd)) points++;
    if (/[0-9]/.test(pwd)) points++;
    if (/[^A-Za-z0-9]/.test(pwd)) points++;
    return points;
  };

  const strength = getStrength(password);
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-error-500', 'bg-warning-500', 'bg-primary-400', 'bg-success-500'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i < strength ? colors[strength - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      {password && (
        <p className="text-[10px] uppercase font-bold mt-1 text-gray-500 tracking-wider">
          Security: <span className={strength > 2 ? 'text-success-600' : 'text-gray-500'}>{labels[strength - 1]}</span>
        </p>
      )}
    </div>
  );
};