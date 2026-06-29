import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

const phoneRegex = /^[+]?[\d\s\-().]*$/;

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Max 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Max 50 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional().refine(val => !val || phoneRegex.test(val), {
    message: 'Mobile number must contain only numbers and optional symbols (+, -, spacing)',
  }),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        department: data.department || undefined,
        jobTitle: data.jobTitle || undefined,
      });

      toast.success('Account Created!', 'Your account has been created successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error('Registration Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
      hasError
        ? 'border-rose-300 focus:border-rose-450 focus:ring-rose-100/70'
        : 'border-slate-150 focus:border-brand-550 focus:ring-brand-100/60'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-25 px-4 relative overflow-hidden py-12">
      {/* Background visual accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-100/30 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-brand-200/20 blur-3xl" />

      {/* Auth glossy card */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-100/80 shadow-glossy-lg rounded-3xl p-8 max-w-lg w-full relative z-10 transition-all">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 select-none">
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-glossy shadow-brand-200 mb-4">
            <img src="/favicon.png" alt="FlowCRM AI" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">
            Create Your <span className="text-brand-550">FlowCRM AI</span> Account
          </h2>
          <p className="text-xs text-slate-450 font-medium">
            Set up your enterprise workspace credentials to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
                {...register('firstName')}
                className={inputClass(!!errors.firstName)}
              />
              {errors.firstName && (
                <p className="text-xs font-semibold text-rose-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                {...register('lastName')}
                className={inputClass(!!errors.lastName)}
              />
              {errors.lastName && (
                <p className="text-xs font-semibold text-rose-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john.doe@company.com"
              {...register('email')}
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Optional fields row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
                Phone <span className="text-slate-350 font-medium normal-case">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
                className={inputClass(!!errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs font-semibold text-rose-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
                Department <span className="text-slate-350 font-medium normal-case">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sales"
                {...register('department')}
                className={inputClass(false)}
              />
            </div>
          </div>

          {/* Job title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
              Job Title <span className="text-slate-350 font-medium normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sales Manager"
              {...register('jobTitle')}
              className={inputClass(false)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={inputClass(!!errors.password)}
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
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              <span className="text-[10px] text-slate-400 font-medium">8+ chars</span>
              <span className="text-[10px] text-slate-400 font-medium">Uppercase</span>
              <span className="text-[10px] text-slate-400 font-medium">Lowercase</span>
              <span className="text-[10px] text-slate-400 font-medium">Number</span>
              <span className="text-[10px] text-slate-400 font-medium">Special char</span>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={inputClass(!!errors.confirmPassword)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-semibold text-rose-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-brand-550 text-white font-bold rounded-xl hover:bg-brand-600 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Create Account</span>
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100/60 pt-5">
          <p className="text-xs text-slate-400 font-medium">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
