import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Form, message } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { loginApi } from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '@/hooks';
import { USER_LOCAL_STORAGE_KEY } from '@/contants';
import { UserInfo } from '@/types/common';
import { setToken } from '@/services/request';
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(8, '密码长度至少为8位')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      '密码至少8位，包含字母、数字和特殊字符'
    )
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [_user, setUser] = useStorage<UserInfo | null>(USER_LOCAL_STORAGE_KEY, null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      console.log('Login data:', data);
      // TODO: 调用登录 API
      const res = await loginApi(data);
      console.log('Login response:', res);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      <div className="w-full max-w-sm px-4">
        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 px-7 py-6">
          {/* Logo 和标题 */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/25 mb-3">
              <span className="text-lg font-bold text-white">Boya</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-1">
              欢迎回来
            </h1>
            <p className="text-slate-500 text-xs">
              登录以继续使用国际化管理平台
            </p>
          </div>

          {/* 登录表单 */}
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              {/* 邮箱输入 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  邮箱地址
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="请输入邮箱地址"
                      prefix={<MailOutlined className="text-slate-400" />}
                      status={errors.email ? 'error' : undefined}
                      className="rounded-lg h-9 border-slate-200 hover:border-blue-400 focus:border-blue-500"
                    />
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* 密码输入 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  密码
                </label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
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
                      status={errors.password ? 'error' : undefined}
                      className="rounded-lg h-9 border-slate-200 hover:border-blue-400 focus:border-blue-500"
                    />
                  )}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* 忘记密码链接 */}
              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  忘记密码？
                </a>
              </div>

              {/* 登录按钮 */}
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-9 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0 shadow-md shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 font-medium"
              >
                登录
              </Button>
            </div>
          </Form>

          {/* 分隔线 */}
          <div className="relative my-3">
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400">或</span>
            </div>
          </div>

          {/* 飞书登录 */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300">
              <img src="/images/feishu.logo.svg" alt="飞书登录" className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}