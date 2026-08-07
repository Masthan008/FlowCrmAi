import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, CheckCircle2, Building2, User, Sparkles,
  ArrowRight, ArrowLeft, ShieldCheck, Globe, DollarSign, Briefcase, ChevronRight
} from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/ui/Logo';

const phoneRegex = /^[+]?[\d\s\-().]*$/;

// Validation schema covering Admin User & Company Organization fields
const registerSchema = z.object({
  // Step 1: User Account
  firstName: z.string().min(1, 'First name is required').max(50, 'Max 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Max 50 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid work email address'),
  phone: z.string().optional().refine(val => !val || phoneRegex.test(val), {
    message: 'Mobile number must contain only numbers and symbols (+, -)',
  }),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),

  // Step 2: Company & Business Profile
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyLegalName: z.string().optional(),
  workspaceSlug: z.string().optional(),
  industry: z.string().min(1, 'Please select an industry sector'),
  employeeCount: z.string().optional(),
  gstNumber: z.string().optional(),
  website: z.string().optional(),
  primaryPhone: z.string().optional(),

  // Step 3: CRM Setup & Preferences
  currency: z.string().default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
  primaryGoal: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      industry: 'Technology & SaaS',
      employeeCount: '10',
    },
  });

  const watchCompanyName = watch('companyName');
  const watchWorkspaceSlug = (watchCompanyName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(['firstName', 'lastName', 'email', 'password', 'confirmPassword']);
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = await trigger(['companyName', 'industry']);
      if (isValid) setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const onSubmit = async (data: RegisterFields) => {
    setIsLoading(true);
    try {
      // 1. Submit complete User & Organization payload
      const regRes = await api.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        jobTitle: data.jobTitle || 'Administrator',
        department: data.department || 'Management',

        // Company & Organization Fields
        companyName: data.companyName,
        companyLegalName: data.companyLegalName || data.companyName,
        industry: data.industry,
        employeeCount: data.employeeCount ? parseInt(data.employeeCount, 10) : 10,
        gstNumber: data.gstNumber || undefined,
        currency: data.currency || 'INR',
        timezone: data.timezone || 'Asia/Kolkata',
        website: data.website || undefined,
        primaryPhone: data.primaryPhone || data.phone || undefined,
      });

      // 2. Auto Login User
      const loginRes = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { accessToken, refreshToken, user, role, permissions } = loginRes.data.data;
      setAuth(accessToken, refreshToken, user, role, permissions);

      toast.success(
        'Workspace Provisioned!',
        `Welcome to FlowCRM AI Enterprise, ${user.firstName}! Organization ${data.companyName} is ready.`
      );

      navigate('/', { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error('Registration Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl bg-slate-950/60 focus:outline-none focus:bg-slate-950 focus:ring-2 transition-all font-medium text-white placeholder-slate-500 ${
      hasError
        ? 'border-rose-500/80 focus:ring-rose-500/30'
        : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white selection:bg-indigo-500 selection:text-white px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Visual Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/20 to-transparent blur-[160px] pointer-events-none" />

      {/* Main Form Container */}
      <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 sm:p-10 max-w-2xl w-full relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="md" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              Provision Your Enterprise Workspace
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-1">
              Step {currentStep} of 3 • Set up your account, company profile, and CRM defaults
            </p>
          </div>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 1, label: 'Admin Account' },
            { step: 2, label: 'Company Profile' },
            { step: 3, label: 'CRM Setup' },
          ].map((st) => (
            <div key={st.step} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentStep >= st.step
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    : 'bg-slate-800'
                }`}
              />
              <span className={`text-[10px] font-bold block text-center ${currentStep === st.step ? 'text-indigo-400' : 'text-slate-500'}`}>
                {st.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* ─── STEP 1: ADMIN ACCOUNT ───────────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">Step 1: Admin Account Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">First Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul"
                      {...register('firstName')}
                      className={inputClass(!!errors.firstName)}
                    />
                    {errors.firstName && <p className="text-[11px] font-bold text-rose-400">{errors.firstName.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Last Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      {...register('lastName')}
                      className={inputClass(!!errors.lastName)}
                    />
                    {errors.lastName && <p className="text-[11px] font-bold text-rose-400">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Work Email *</label>
                    <input
                      type="email"
                      placeholder="rahul@company.com"
                      {...register('email')}
                      className={inputClass(!!errors.email)}
                    />
                    {errors.email && <p className="text-[11px] font-bold text-rose-400">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Mobile Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      {...register('phone')}
                      className={inputClass(!!errors.phone)}
                    />
                    {errors.phone && <p className="text-[11px] font-bold text-rose-400">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-300 uppercase">Password *</label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] font-bold text-rose-400">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-300 uppercase">Confirm Password *</label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-[11px] font-bold text-rose-400">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer transition-all flex items-center gap-2"
                  >
                    <span>Next: Company Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: COMPANY PROFILE ──────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">Step 2: Company & Business Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Company / Organization Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Global Technologies"
                      {...register('companyName')}
                      className={inputClass(!!errors.companyName)}
                    />
                    {errors.companyName && <p className="text-[11px] font-bold text-rose-400">{errors.companyName.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Workspace Subdomain</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-800 text-slate-400 text-xs font-mono rounded-l-xl border border-r-0 border-slate-700">
                        https://
                      </span>
                      <input
                        type="text"
                        disabled
                        value={watchWorkspaceSlug || 'acme'}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-xs text-indigo-400 font-mono font-bold focus:outline-none"
                      />
                      <span className="px-3 py-2.5 bg-slate-800 text-slate-400 text-xs font-mono rounded-r-xl border border-l-0 border-slate-700">
                        .flowcrm.ai
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Industry Sector *</label>
                    <select
                      {...register('industry')}
                      className={`${inputClass(!!errors.industry)} text-white`}
                    >
                      <option value="Technology & SaaS">Technology & SaaS</option>
                      <option value="FinTech & Banking">FinTech & Banking</option>
                      <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                      <option value="Professional Services & Consulting">Professional Services & Consulting</option>
                      <option value="Real Estate & Construction">Real Estate & Construction</option>
                      <option value="Education & EdTech">Education & EdTech</option>
                    </select>
                    {errors.industry && <p className="text-[11px] font-bold text-rose-400">{errors.industry.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Employee Range</label>
                    <select
                      {...register('employeeCount')}
                      className={`${inputClass(false)} text-white`}
                    >
                      <option value="5">1 - 10 Employees</option>
                      <option value="25">11 - 50 Employees</option>
                      <option value="100">51 - 250 Employees</option>
                      <option value="500">251 - 1,000 Employees</option>
                      <option value="2500">1,000+ Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Tax ID / GSTIN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 27AAACA0000A1Z5"
                      {...register('gstNumber')}
                      className={inputClass(false)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Company Website</label>
                    <input
                      type="text"
                      placeholder="https://apex.com"
                      {...register('website')}
                      className={inputClass(false)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="py-3 px-5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 cursor-pointer transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer transition-all flex items-center gap-2"
                  >
                    <span>Next: CRM Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: CRM SETUP ───────────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">Step 3: CRM Workspace Setup & Preferences</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Primary Business Currency *</label>
                    <select
                      {...register('currency')}
                      className={`${inputClass(false)} text-white font-mono font-bold`}
                    >
                      <option value="INR">INR (₹) — Indian Rupee</option>
                      <option value="USD">USD ($) — US Dollar</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="GBP">GBP (£) — British Pound</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase">Default Timezone</label>
                    <select
                      {...register('timezone')}
                      className={`${inputClass(false)} text-white`}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                      <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
                      <option value="Europe/London">Europe/London (GMT - UTC+00:00)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Automated Enterprise Seeding
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Your workspace will be provisioned with default Sales Pipeline stages, Lead SLA rules, and multi-tenant security scoping.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="py-3 px-5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 cursor-pointer transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer transition-all flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Provisioning Organization...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup & Launch Workspace</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer Navigation link */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an enterprise account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Sign In to Workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
