import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

// Validate inputs
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

type LoginFields = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login: setAuth } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    }
  });

  // Resolve landing route path
  const from = (location.state as any)?.from?.pathname || '/';

  const onSubmit = async (data: LoginFields) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { accessToken, refreshToken, user, role, permissions } = response.data.data;
      
      // Update state
      setAuth(accessToken, refreshToken, user, role, permissions);
      
      toast.success('Welcome Back!', `Logged in successfully as ${user.fullName}`);
      navigate(from, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error('Authentication Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-25 px-4 relative overflow-hidden py-12">
      {/* Background visual accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-100/30 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-brand-200/20 blur-3xl" />

      {/* Auth glossy card */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-100/80 shadow-glossy-lg rounded-3xl p-8 max-w-md w-full relative z-10 transition-all">
        {/* Header Header */}
        <div className="flex flex-col items-center text-center mb-8 select-none">
          <div className="w-12 h-12 rounded-2xl bg-brand-550 flex items-center justify-center text-white font-black text-xl shadow-glossy shadow-brand-200 mb-4 animate-pulse">
            F
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">
            Sign In to FlowCRM <span className="text-brand-550">AI</span>
          </h2>
          <p className="text-xs text-slate-450 font-medium">
            Enter your credentials to access your enterprise workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email input */}
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

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`w-full pl-4 pr-12 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                  errors.password
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
            {errors.password && (
              <p className="text-xs font-semibold text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded-md border-slate-350 text-brand-550 focus:ring-brand-500 focus:ring-offset-0 focus:ring-opacity-0"
              />
              <span className="text-xs text-slate-500 font-semibold">Remember this device</span>
            </label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-brand-550 text-white font-bold rounded-xl hover:bg-brand-600 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100/60 pt-5">
          <p className="text-xs text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
