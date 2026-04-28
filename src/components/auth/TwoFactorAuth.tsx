import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const TwoFactorAuth = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 6) {
      toast.success('Security Verified!');
      navigate('/dashboard/investor'); // Or based on role
    } else {
      toast.error('Please enter the full 6-digit code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="inline-flex p-4 rounded-full bg-primary-50 text-primary-600 mb-6">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Two-Step Verification</h2>
        <p className="text-gray-500 mt-2 mb-8">Enter the code sent to your registered device.</p>
        
        <div className="flex justify-center gap-2 mb-8">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 outline-none transition-all"
              value={data}
              onChange={e => handleChange(e.target, index)}
            />
          ))}
        </div>
        
        <button 
          onClick={handleVerify}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-200"
        >
          Verify & Continue
        </button>
      </div>
    </div>
  );
};