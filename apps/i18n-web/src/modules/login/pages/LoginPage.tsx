import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Form, message } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getFeishuAuthUrlApi, loginApi, loginByFeishuApi, resetPasswordApi } from '@/api/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '@/services/request';
import { useAppStore } from '@/stores';

const passwordRule = z
  .string()
  .min(1, '请输入密码')
  .min(8, '密码长度至少为8位')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    '密码至少8位，包含字母、数字和特殊字符'
  );

const loginSchema = z.object({
  email: z.string().min(1, '请输入邮箱地址').email('请输入有效的邮箱地址'),
  password: passwordRule,
});

const resetSchema = z
  .object({
    email: z.string().min(1, '请输入邮箱地址').email('请输入有效的邮箱地址'),
    password: passwordRule,
    confirmPassword: z.string().min(1, '请再次输入密码'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

type PageMode = 'login' | 'reset';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<PageMode>('login');
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const hasHandledCode = useRef(false);

  useEffect(() => {
    if (code && !hasHandledCode.current) {
      hasHandledCode.current = true;
      loginByFeishu(code);
    }
  }, [code]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await loginApi(data);
      message.success('登录成功');
      setUser(res.data.user);
      setToken(res.data.accessToken);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setLoading(true);
    try {
      await resetPasswordApi(data.email, data.password);
      message.success('密码重置成功，请使用新密码登录');
      switchTo('login');
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginByFeishu = async (code: string) => {
    try {
      const res = await loginByFeishuApi(code);
      setUser(res.data.user);
      setToken(res.data.accessToken);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Feishu login error:', error);
      message.error('飞书登录失败');
    }
  };

  const handleFeishuLogin = async () => {
    try {
      const res = await getFeishuAuthUrlApi();
      window.location.href = res.data;
    } catch (error) {
      console.error('Feishu login error:', error);
    }
  };

  const switchTo = (target: PageMode) => {
    setMode(target);
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (target === 'login') {
      resetForm.reset();
    } else {
      loginForm.reset();
    }
  };

  const title = mode === 'login' ? '欢迎回来' : '重置密码';
  const subtitle =
    mode === 'login'
      ? '登录以继续使用国际化管理平台'
      : '输入邮箱和新密码来重置你的密码';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      <div className="w-full max-w-sm px-4">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 px-7 py-6">
          {/* Logo 和标题 */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/25 mb-3">
              <span className="text-lg font-bold text-white">Boya</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-1 transition-all duration-300">
              {title}
            </h1>
            <p className="text-slate-500 text-xs transition-all duration-300">
              {subtitle}
            </p>
          </div>

          {/* ========== 登录表单 ========== */}
          {mode === 'login' && (
            <Form layout="vertical" onFinish={loginForm.handleSubmit(onLoginSubmit)}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">邮箱地址</label>
                  <Controller
                    name="email"
                    control={loginForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="请输入邮箱地址"
                        prefix={<MailOutlined className="text-slate-400" />}
                        status={loginForm.formState.errors.email ? 'error' : undefined}
                        className="rounded-lg h-9 border-slate-200 hover:border-blue-400 focus:border-blue-500"
                      />
                    )}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">密码</label>
                  <Controller
                    name="password"
                    control={loginForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        placeholder="请输入密码"
                        prefix={<LockOutlined className="text-slate-400" />}
                        suffix={
                          <span
                            className="cursor-pointer text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          </span>
                        }
                        status={loginForm.formState.errors.password ? 'error' : undefined}
                        className="rounded-lg h-9 border-slate-200 hover:border-blue-400 focus:border-blue-500"
                      />
                    )}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchTo('reset')}
                    className="text-xs text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer p-0"
                  >
                    忘记密码？
                  </button>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="h-9 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0 shadow-md shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 font-medium"
                >
                  登录
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-xs text-slate-400">或</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleFeishuLogin}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-solid border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
                    title="飞书登录"
                  >
                    <img src="/images/feishu.logo.svg" alt="飞书" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Form>
          )}

          {/* ========== 重置密码表单 ========== */}
          {mode === 'reset' && (
            <Form layout="vertical" onFinish={resetForm.handleSubmit(onResetSubmit)}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">邮箱地址</label>
                  <Controller
                    name="email"
                    control={resetForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="请输入注册时的邮箱"
                        prefix={<MailOutlined className="text-slate-400" />}
                        status={resetForm.formState.errors.email ? 'error' : undefined}
                        className="rounded-lg h-9 border-slate-200 hover:border-blue-400 focus:border-blue-500"
                      />
                    )}
                  />
                  {resetForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">新密码</label>
                  <Controller
                    name="password"
                    control={resetForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        placeholder="至少8位，包含字母、数字和特殊字符"
                        prefix={<LockOutlined className="text-slate-400" />}
                        suffix={
                          <span
                            className="cursor-pointer text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          </span>
                        }
                        status={resetForm.formState.errors.password ? 'error' : undefined}
                        className="rounded-lg h-9 border-slate-200 hover:border-blue-400 focus:border-blue-500"
                      />
                    )}
                  />
                  {resetForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">确认密码</label>
                  <Controller
                    name="confirmPassword"
                    control={resetForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="off"
                        placeholder="再次输入新密码"
                        prefix={<LockOutlined className="text-slate-400" />}
                        suffix={
                          <span
                            className="cursor-pointer text-slate-400 hover:text-slate-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          </span>
                        }
                        status={resetForm.formState.errors.confirmPassword ? 'error' : undefined}
                        className="rounded-lg h-9 border-slate-200 hover:border-blue-400 focus:border-blue-500"
                      />
                    )}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="h-9 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0 shadow-md shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 font-medium"
                >
                  重置密码
                </Button>

                <button
                  type="button"
                  onClick={() => switchTo('login')}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 bg-transparent border-0 cursor-pointer py-1 transition-colors"
                >
                  <ArrowLeftOutlined className="text-[10px]" />
                  返回登录
                </button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
