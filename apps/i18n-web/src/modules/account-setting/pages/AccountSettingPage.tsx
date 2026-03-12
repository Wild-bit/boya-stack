import { useState } from 'react';
import { z } from 'zod';
import { Button, Form, Input, Menu, message, Upload } from 'antd';
import type { MenuProps, UploadProps } from 'antd';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { editUserInfoApi } from '@/api/user';
import { uploadFile } from '@/services';
import { useAppStore } from '@/stores';

type TabKey = 'general';

const menuItems: MenuProps['items'] = [
  { key: 'general', label: '通用', icon: <UserOutlined /> },
];

const profileSchema = z.object({
  name: z.string().min(1, '用户名不能为空').max(12, '用户名最多 12 个字符'),
  bio: z.string().max(200, '个人简介最多 200 个字符').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')
    .optional()
    .or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/** 将 zod schema 某个字段转为 antd Form rules validator */
function zodFieldRule(fieldName: keyof ProfileFormData) {
  return {
    validator(_: unknown, value: string) {
      const partial = { name: '', bio: '', phone: '', [fieldName]: value };
      const result = profileSchema.safeParse(partial);
      if (result.success) return Promise.resolve();
      const fieldError = result.error.issues.find((i) => i.path[0] === fieldName);
      return fieldError ? Promise.reject(fieldError.message) : Promise.resolve();
    },
  };
}

export function AccountSettingPage() {
  const { user: currentUser, updateUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm<ProfileFormData>();

  const handleAvatarChange: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      await editUserInfoApi({ avatar: url });
      updateUser({ avatar: url });
      message.success('头像上传成功');
    } catch {
      message.error('头像上传失败');
    } finally {
      setUploading(false);
    }
  };

  const onFinish = async (data: ProfileFormData) => {
    setSubmitting(true);
    try {
      const res = await editUserInfoApi({
        name: data.name,
        bio: data.bio || undefined,
        phone: data.phone || undefined,
      });
      useAppStore.getState().setUser(res.data);
      message.success('保存成功');
    } catch {
      message.error('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setActiveTab(key as TabKey);
  };

  const avatarUrl = currentUser?.avatar;
  const avatarInitial = currentUser?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden max-w-[1400px] mx-auto min-h-[calc(100vh-120px)] flex flex-col">
      <Menu
        items={menuItems}
        selectedKeys={[activeTab]}
        onClick={handleMenuClick}
        mode="horizontal"
        className="!bg-slate-50/80 border-b border-slate-200/60 px-3 shrink-0"
      />

      <div className="flex-1 p-8">
        {activeTab === 'general' && (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              name: currentUser?.name || '',
              bio: currentUser?.bio || '',
              phone: currentUser?.phone || '',
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 [&>div]:flex [&>div]:flex-col">
              {/* Avatar Card */}
              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <div className="p-6 flex-1 flex items-start justify-between bg-white">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">头像</h2>
                    <p className="text-sm text-slate-500">点击头像上传一张图片文件</p>
                  </div>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    customRequest={handleAvatarChange}
                    disabled={uploading}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-center bg-slate-50">
                      {uploading ? (
                        <LoadingOutlined className="text-2xl text-blue-400" />
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-semibold text-slate-400">{avatarInitial}</span>
                      )}
                    </div>
                  </Upload>
                </div>
                <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200/60 mt-auto">
                  <p className="text-sm text-slate-400">头像不是必须的，但推荐上传一个</p>
                </div>
              </div>

              {/* Email Card (read-only) */}
              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <div className="p-6 flex-1 bg-white">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">邮箱</h2>
                  <p className="text-sm text-slate-500 mb-4">账户绑定的邮箱地址，不可修改</p>
                  <Input value={currentUser?.email || ''} size="large" disabled />
                </div>
                <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200/60 mt-auto">
                  <p className="text-sm text-slate-400">如需更换邮箱请联系管理员</p>
                </div>
              </div>

              {/* Username Card */}
              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <div className="p-6 flex-1 bg-white">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">
                    用户名 <span className="text-red-500 text-sm">*</span>
                  </h2>
                  <p className="text-sm text-slate-500 mb-4">请输入一个显示用的名字，协作团队可见</p>
                  <Form.Item name="name" rules={[zodFieldRule('name')]} className="!mb-0">
                    <Input maxLength={12} size="large" placeholder="请输入用户名" />
                  </Form.Item>
                </div>
                <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200/60 mt-auto">
                  <p className="text-sm text-slate-400">最多 12 个字符</p>
                </div>
              </div>

              {/* Bio Card */}
              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <div className="p-6 flex-1 bg-white">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">个人简介</h2>
                  <p className="text-sm text-slate-500 mb-4">请输入一段个人简介，协作团队可见</p>
                  <Form.Item name="bio" rules={[zodFieldRule('bio')]} className="!mb-0">
                    <Input.TextArea rows={3} maxLength={200} showCount placeholder="请输入个人简介" />
                  </Form.Item>
                </div>
                <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200/60 mt-auto">
                  <p className="text-sm text-slate-400">最多 200 个字符</p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <div className="p-6 flex-1 bg-white">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">手机号</h2>
                  <p className="text-sm text-slate-500 mb-4">请输入手机号，协作团队可见</p>
                  <Form.Item name="phone" rules={[zodFieldRule('phone')]} className="!mb-0">
                    <Input size="large" placeholder="请输入手机号" />
                  </Form.Item>
                </div>
                <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200/60 mt-auto">
                  <p className="text-sm text-slate-400">仅限中国大陆手机号</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button type="primary" htmlType="submit" loading={submitting} size="large" className="px-8">
                保存设置
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}
