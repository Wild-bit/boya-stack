import { useState } from 'react';
import { Button, Input, Menu, message, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { useAppStore } from '@/stores';
import { editTeamInfoApi } from '@/api/organization/index';

type TabKey = 'general' | 'members';

const menuItems: MenuProps['items'] = [
  { key: 'general', label: '通用', icon: <SettingOutlined /> },
  { key: 'members', label: '成员', icon: <TeamOutlined /> },
];

export function SettingsPage() {
  const { currentTeam, updateCurrentTeam } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [teamName, setTeamName] = useState(currentTeam?.name || '');
  const [teamUrlSlug, setTeamUrlSlug] = useState(currentTeam?.slug || '');
  const [savingName, setSavingName] = useState(false);
  const [savingSlug, setSavingSlug] = useState(false);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setActiveTab(key as TabKey);
  };

  const handleSaveName = async () => {
    if (!teamName.trim()) {
      message.error('团队名称不能为空');
      return;
    }
    setSavingName(true);
    try {
      await editTeamInfoApi({
        id: currentTeam!.id,
        name: teamName,
      });
      updateCurrentTeam({ name: teamName });
      message.success('团队名称已更新');
    } catch {
      message.error('保存失败');
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveSlug = async () => {
    if (!teamUrlSlug.trim()) {
      message.error('团队 URL 不能为空');
      return;
    }
    setSavingSlug(true);
    try {
      await editTeamInfoApi({
        id: currentTeam!.id,
        slug: teamUrlSlug,
      });
      updateCurrentTeam({ slug: teamUrlSlug });
      message.success('团队 URL 已更新');
    } catch {
      message.error('保存失败');
    } finally {
      setSavingSlug(false);
    }
  };

  const handleDeleteTeam = () => {
    Modal.confirm({
      title: '确认删除团队',
      content: '永久删除该团队和该团队下所有内容，此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // TODO: call delete team API
          message.success('团队已删除');
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <div className="shrink-0 w-[200px]">
        <Menu
          items={menuItems}
          selectedKeys={[activeTab]}
          onClick={handleMenuClick}
          className="!border-none"
        />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 pr-6 pb-6 pt-2">
        {activeTab === 'general' && (
          <>
            {/* Team Name Card */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">团队名称</h2>
                <p className="text-sm text-slate-500 mb-4">请输入一个显示用的团队名称</p>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  maxLength={12}
                  size="large"
                  placeholder="请输入团队名称"
                />
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-400">最多 12 个字符</span>
                <Button type="primary" loading={savingName} onClick={handleSaveName}>
                  保存
                </Button>
              </div>
            </div>

            {/* Team URL Card */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">团队 URL</h2>
                <p className="text-sm text-slate-500 mb-4">这也是你在云词的唯一团队空间名</p>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 rounded-l-md bg-slate-50 text-sm text-slate-500">
                    i18n.lancespace.club/
                  </span>
                  <Input
                    value={teamUrlSlug}
                    onChange={(e) => setTeamUrlSlug(e.target.value)}
                    maxLength={24}
                    size="large"
                    className="!rounded-l-none"
                    placeholder="请输入团队标识"
                  />
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  团队标识，最多 24 个字符，只能是大小写字母、数字、下划线和横线
                </span>
                <Button type="primary" loading={savingSlug} onClick={handleSaveSlug}>
                  保存
                </Button>
              </div>
            </div>

            {/* Delete Team Card */}
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">删除团队</h2>
                <p className="text-sm text-slate-500">
                  永久删除该团队和该团队下所有内容，不可恢复
                </p>
              </div>
              <div className="px-6 py-3 bg-red-50/50 border-t border-red-200 flex justify-end">
                <Button danger type="primary" onClick={handleDeleteTeam}>
                  删除
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <div className="border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">团队成员</h2>
            <p className="text-sm text-slate-500">管理团队成员及其权限</p>
            {/* TODO: members list */}
          </div>
        )}
      </div>
    </div>
  );
}
