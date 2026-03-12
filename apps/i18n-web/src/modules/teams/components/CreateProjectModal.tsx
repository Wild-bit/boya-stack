import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Input, Form, Select, message } from 'antd';
import { createProjectApi } from '@/api/organization';
import { useState } from 'react';

const LOCALE_OPTIONS = [
  { value: 'zh-cn', label: '简体中文 (zh-CN)' },
  { value: 'zh-tw', label: '繁体中文 (zh-TW)' },
  { value: 'en', label: 'English (en)' },
  { value: 'ja', label: '日本語 (ja)' },
  { value: 'ko', label: '韩语 (ko)' },
  { value: 'fr', label: '法语 (fr)' },
  { value: 'de', label: '德语 (de)' },
  { value: 'es', label: '西班牙语 (es)' },
  { value: 'pt', label: '葡萄牙语 (pt)' },
  { value: 'ru', label: '俄语 (ru)' },
  { value: 'ar', label: '阿拉伯语 (ar)' },
  { value: 'th', label: '泰语 (th)' },
  { value: 'vi', label: '越南语 (vi)' },
  { value: 'it', label: '意大利语 (it)' },
  { value: 'id', label: '印尼语 (id)' },
];

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, '请输入项目名称')
    .max(50, '项目名称最多50个字符'),
  sourceLocale: z
    .string()
    .min(1, '请选择源语言'),
  targetLanguages: z
    .array(z.string())
    .min(1, '请至少选择一个目标语言'),
  description: z
    .string()
    .max(200, '项目描述最多200个字符')
    .optional()
    .or(z.literal('')),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  teamId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProjectModal({ open, teamId, onClose, onSuccess }: CreateProjectModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      sourceLocale: '',
      targetLanguages: [],
      description: '',
    },
    mode: 'onBlur',
  });

  const sourceLocale = watch('sourceLocale');

  const targetLocaleOptions = LOCALE_OPTIONS.filter(
    (opt) => opt.value !== sourceLocale
  );

  const onSubmit = async (data: CreateProjectFormData) => {
    setSubmitting(true);
    try {
      await createProjectApi({ ...data, teamId });
      message.success('项目创建成功');
      reset();
      onSuccess?.();
      onClose();
    } catch {
      message.error('项目创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      title="创建项目"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit(onSubmit)}
      okText="创建"
      cancelText="取消"
      confirmLoading={submitting}
      destroyOnHidden={false}
      width={520}
    >
      <Form layout="vertical" className="mt-4">
        <Form.Item
          label="项目名称"
          required
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="输入项目名称"
                maxLength={50}
                showCount
                autoFocus
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="源语言"
          required
          validateStatus={errors.sourceLocale ? 'error' : ''}
          help={errors.sourceLocale?.message}
        >
          <Controller
            name="sourceLocale"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="选择源语言"
                options={LOCALE_OPTIONS}
                showSearch
                optionFilterProp="label"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="目标语言"
          required
          validateStatus={errors.targetLanguages ? 'error' : ''}
          help={errors.targetLanguages?.message}
        >
          <Controller
            name="targetLanguages"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="multiple"
                placeholder="选择目标语言"
                options={targetLocaleOptions}
                showSearch
                optionFilterProp="label"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="项目描述"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                placeholder="简单描述一下这个项目（选填）"
                maxLength={200}
                showCount
                rows={3}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
