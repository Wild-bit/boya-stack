import { useAppStore } from '@/stores';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Dropdown, Form, Input, message } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CURRENT_TEAM_SLUG_LOCAL_STORAGE_KEY } from '@/contants';
import { IconSvg } from '@/components/IconSvg';
import { createTeamApi } from '@/api/organization';
import { Modal } from 'antd';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CreateTeamRequest } from '@/api/organization/types';
export function TeamSwitcher() {
  const { teams, user: currentUser } = useAppStore();
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<CreateTeamRequest>({
    defaultValues: {
      name: undefined,
      description: undefined,
    },
  });

  const onSubmit = async (data: CreateTeamRequest) => {
    try {
      const res = await createTeamApi({
        ownerId: currentUser?.id ?? '',
        name: data.name,
        description: data.description,
        slug: data.slug,
      });
      console.log(res);
      setCreateTeamModalOpen(false);
      message.success('创建团队成功');
    } catch (error) {
      console.error(error);
      message.error('创建团队失败');
    }
  };
  const currentTeam = teams.find((t) => t.slug === teamSlug);

  const items: MenuProps['items'] = [
    {
      key: 'header',
      label: <span className="text-md text-gray-400 font-normal">团队</span>,
      type: 'group',
      children: teams.map((team) => ({
        key: team.slug,
        label: team.name,
      })),
    },
    { type: 'divider' },
    {
      key: 'create',
      icon: <PlusOutlined />,
      label: '创建团队',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'create') {
      setCreateTeamModalOpen(true);
      return;
    }
    localStorage.setItem(CURRENT_TEAM_SLUG_LOCAL_STORAGE_KEY, key);
    navigate(`/${key}`);
  };

  return (
    <>
      <div className='cursor-pointer font-medium text-sm flex items-center gap-1.5 text-black transition-colors' onClick={() => teamSlug && (navigate(`/${teamSlug}`))}>
        {currentTeam?.name || teamSlug || '选择团队'}
      </div >
      <Dropdown
        trigger={['hover']}
        placement="bottom"
        menu={{
          items,
          onClick: handleMenuClick,
          selectedKeys: teamSlug ? [teamSlug] : [],
        }}
      >
        <div className='py-2 px-1 rounded-sm hover:bg-[#eee] transition-colors flex items-center justify-center'>
          <IconSvg name="down-outlined" size={12} />
        </div>
      </Dropdown>
      <Modal open={createTeamModalOpen} onCancel={() => setCreateTeamModalOpen(false)} title="创建团队" footer={null}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Controller name="name" control={control} render={({ field }) => (
            <Input {...field} placeholder="请输入团队名称" className="rounded-lg h-9 border-slate-200" />
          )} />
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setCreateTeamModalOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>创建</Button>
          </div>
        </Form>
      </Modal >
    </>
  );
}
