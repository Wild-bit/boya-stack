import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const status = isNotFound ? '404' : '500';
  const title = isNotFound ? '页面不存在' : '出错了';
  const subTitle = isNotFound
    ? '您访问的页面不存在或已被移除。'
    : error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? error.statusText || '请求失败，请稍后重试。'
        : '发生了未知错误，请稍后重试。';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      <div className="w-full max-w-lg px-4">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-8">
          <Result
            status={status as '404' | '500'}
            title={title}
            subTitle={subTitle}
            extra={[
              <Button
                key="home"
                type="primary"
                icon={<HomeOutlined />}
                onClick={() => navigate('/', { replace: true })}
                className="rounded-lg"
              >
                返回首页
              </Button>,
              <Button
                key="reload"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
                className="rounded-lg"
              >
                刷新页面
              </Button>,
            ]}
          />
        </div>
      </div>
    </div>
  );
}
