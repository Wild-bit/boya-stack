import { Typography, Card, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { getTeamListApi } from '@/api/teams';
import { useFetch } from '@/hooks/useFetch';
import type { TeamListResponse } from '@/api/teams/types';

const { Title, Paragraph } = Typography;

export function HomePage() {
  const techStack = [
    { name: 'React 19', description: '前端框架' },
    { name: 'Vite', description: '构建工具' },
    { name: 'TypeScript', description: '类型安全' },
    { name: 'Ant Design', description: 'UI 组件库' },
    { name: 'TailwindCSS', description: '原子化 CSS' },
    { name: 'Zustand', description: '状态管理' },
    { name: 'SWR', description: '数据请求' },
    { name: 'React Hook Form + Zod', description: '表单处理与校验' },
  ];
  const { data: teamList, isLoading, error } = useFetch<TeamListResponse>('/teams', {
    fetcher: async () => {
      const response = await getTeamListApi({
        page: 1,
        pageSize: 10,
        keyword: '',
        ownerId: '',
      });
      return response.data;
    },
  });

  console.log(teamList);

  return (
    <div className="max-w-4xl mx-auto">
      <Title level={2}>🚀 项目已成功搭建！</Title>
      <Paragraph className="text-gray-600 text-lg">
        这是一个基于 Monorepo 架构的全栈项目，前端使用 React，后端使用 NestJS。
      </Paragraph>

      <Title level={3} className="mt-8">
        前端技术栈
      </Title>
      <Space wrap size={[16, 16]}>
        {techStack.map((tech) => (
          <Card key={tech.name} size="small" className="w-48">
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" />
              <div>
                <div className="font-medium">{tech.name}</div>
                <div className="text-gray-500 text-xs">{tech.description}</div>
              </div>
            </div>
          </Card>
        ))}
      </Space>
    </div>
  );
}
