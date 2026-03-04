import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { useStorage } from '@/hooks';
import { USER_LOCAL_STORAGE_KEY } from '@/contants';
import type { UserInfo } from '@/types/common';

const { Header, Content, Footer } = Layout;

export function MainLayout() {
  const [user] = useStorage<UserInfo | null>(USER_LOCAL_STORAGE_KEY, null);

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center">
        <div className="text-white text-xl font-bold">{user?.name}</div>
      </Header>
      <Content className="p-6 bg-gray-50">
        <div className="bg-white rounded-lg p-6 min-h-[calc(100vh-180px)]">
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center text-gray-500">
        粤ICP备2025426049号
      </Footer>
    </Layout>
  );
}
