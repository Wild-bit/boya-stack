import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AppstoreOutlined, ExportOutlined, ImportOutlined, SettingOutlined } from '@ant-design/icons';

export function TeamDetailLayout() {
  const { projectSlug } = useParams();
  const location = useLocation();
  const [currentSelectedKey, setCurrentSelectedKey] = useState('projects');
  const items: MenuProps['items'] = [
    {
      key: 'projects',
      label: <Link to="">项目</Link>,
      icon: <AppstoreOutlined />,
    },
    {
      key: 'settings',
      label: <Link to="settings">设置</Link>,
      icon: <SettingOutlined />,
    },
  ];

  const projectItems: MenuProps['items'] = [
    {
      key: 'keys',
      label: <Link to="keys">文案</Link>,
      icon: <AppstoreOutlined />,
    },
    {
      key: 'import',
      label: <Link to="import">导入</Link>,
      icon: <ImportOutlined />,
    },
    {
      key: 'export',
      label: <Link to="export">导出</Link>,
      icon: <ExportOutlined />,
    },
    {
      key: 'settings',
      label: <Link to="settings">设置</Link>,
      icon: <SettingOutlined />,
    },
  ];

  const menuItems = useMemo(() => {
    if (projectSlug) {
      return projectItems;
    }
    return items;
  }, [projectSlug]);


  useEffect(() => {
    const pathName = location.pathname.split('/').pop();
    if (pathName === 'settings') {
      setCurrentSelectedKey('settings');
    } else {
      setCurrentSelectedKey('projects');
    }
  }, [location.pathname])



  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setCurrentSelectedKey(key);
  };
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden max-w-[1400px] mx-auto min-h-[calc(100vh-120px)] flex flex-col">
      <Menu items={menuItems} selectedKeys={[currentSelectedKey]} onClick={handleMenuClick} mode='horizontal' className='!bg-slate-50/80 border-b border-slate-200/60 px-3 shrink-0' />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}