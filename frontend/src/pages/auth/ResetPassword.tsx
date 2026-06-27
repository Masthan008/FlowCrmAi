import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

// Validation schema matching backend strength rules
const resetSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&_#]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type ResetFields = z.infer<typeof resetSchema>;

export const ResetPassword: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token Missing', 'Please request a new reset token.');
      navigate('/forgot-password');
    }
  }, [token, navigate, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFields>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFields) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      setIsSuccess(true);
      toast.success('Password Updated', 'Your password was successfully updated.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Token has expired or is invalid. Request a new password link.';
      toast.error('Reset Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-25 px-4 relative overflow-hidden py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-100/30 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-brand-200/20 blur-3xl" />

      <div className="bg-white/80 backdrop-blur-xl border border-slate-100/80 shadow-glossy-lg rounded-3xl p-8 max-w-md w-full relative z-10">
        {!isSuccess ? (
          <>
            <div className="flex flex-col items-center text-center mb-8 select-none">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-550 font-bold mb-4 shadow-glossy-sm">
                🛡️
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">
                Reset Password
              </h2>
              <p className="text-xs text-slate-450 font-medium">
                Enter your new secure password below to regain access.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('newPassword')}
                    className={`w-full pl-4 pr-12 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                      errors.newPassword
                        ? 'border-rose-300 focus:border-rose-450 focus:ring-rose-100/70'
                        : 'border-slate-150 focus:border-brand-550 focus:ring-brand-100/60'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs font-semibold text-rose-500 leading-tight">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                    errors.confirmPassword
                      ? 'border-rose-300 focus:border-rose-450 focus:ring-rose-100/70'
                      : 'border-slate-150 focus:border-brand-550 focus:ring-brand-100/60'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-semibold text-rose-500 leading-tight">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-550 text-white font-bold rounded-xl hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4 select-none">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-3">
              Reset Completed
            </h2>
            <p className="text-xs text-slate-450 font-medium mb-6 px-4">
              Your password has been successfully updated. You can now use your new credentials to log in.
            </p>
            <Link
              to="/login"
              className="w-full py-2.5 bg-brand-550 hover:bg-brand-600 transition-colors text-white font-bold text-xs rounded-xl flex items-center justify-center"
            >
              Go to Sign In
            </Link>
          </div>
        )}

        {!isSuccess && (
          <div className="mt-6 text-center border-t border-slate-100/60 pt-5">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
