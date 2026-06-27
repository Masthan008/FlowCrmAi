import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFields = z.infer<typeof forgotSchema>;

export const ForgotPassword: React.FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFields>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFields) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        email: data.email,
      });

      setIsSuccess(true);
      if (response.data?.data?.token) {
        setTokenInfo(response.data.data.token);
      }
      toast.success('Reset Link Generated', 'Check the details on screen.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit request. Please try again.';
      toast.error('Submission Failed', message);
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
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-550 font-bold mb-4 shadow-glossy-sm">
                ?
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">
                Forgot Password
              </h2>
              <p className="text-xs text-slate-450 font-medium px-4">
                Enter your email address below and we will generate a password reset token.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. admin@flowcrm.ai"
                  {...register('email')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                    errors.email
                      ? 'border-rose-300 focus:border-rose-450 focus:ring-rose-100/70'
                      : 'border-slate-150 focus:border-brand-550 focus:ring-brand-100/60'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs font-semibold text-rose-500">{errors.email.message}</p>
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
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Send Reset Token</span>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4 select-none">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-3">
              Reset Token Issued
            </h2>
            <p className="text-xs text-slate-450 font-medium mb-6 px-4">
              A secure password reset token was successfully created for your account. Use the token details below to update your password credentials.
            </p>
            
            {tokenInfo && (
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Simulation Reset Token (Mock URL Link)
                </span>
                <code className="text-xs font-mono font-bold break-all text-slate-700 bg-white/70 p-2 rounded-lg border border-slate-150 block mb-3">
                  {tokenInfo}
                </code>
                <Link
                  to={`/reset-password?token=${tokenInfo}`}
                  className="w-full py-2 bg-brand-550 hover:bg-brand-600 transition-colors text-white font-bold text-xs rounded-xl flex items-center justify-center"
                >
                  Proceed to Reset Screen
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center border-t border-slate-100/60 pt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
