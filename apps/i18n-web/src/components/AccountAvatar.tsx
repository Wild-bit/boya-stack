import { Divider, message, Popover } from 'antd';
import { signOutApi } from '@/api/auth';
import { removeToken } from '@/services/request';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores';
import { UserInfo } from '@/types/common';

function PopoverConent({ currentUser }: { currentUser: UserInfo | null }) {
  const navigate = useNavigate();
  const signOut = async () => {
    try {
      await signOutApi();
      useAppStore.getState().clearUser();
      removeToken();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('signOut error:', error);
      message.error('登出失败');
    }
  }
  return (
    <div className='flex flex-col w-[200px]'>
      <div className='p-2 hover:bg-slate-100 rounded-md'>
        <div className='flex gap-2 cursor-not-allowed justify-start'>
          <span className="text-sm">{currentUser?.name}</span>
        </div>
      </div>
      <div className='p-2 hover:bg-slate-100 rounded-md cursor-pointer' onClick={() => navigate('/settings')}>
        <div className='flex gap-2 justify-start'>
          <span className="text-sm">设置</span>
        </div>
      </div>
      <Divider className='my-2' />
      <div className='p-2 hover:bg-slate-100 rounded-md cursor-pointer'>
        <div className='flex gap-2 justify-start' onClick={() => signOut()}>
          <span className="text-sm">登出</span>
        </div>
      </div>
    </div>
  )
}
export function AccountAvatar() {
  const currentUser = useAppStore((s) => s.user);
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <Popover content={<PopoverConent currentUser={currentUser} />} arrow={false} placement='bottomRight'>
        {currentUser?.avatar ? (<img src={currentUser?.avatar} alt="avatar" className="w-8 h-8 rounded-full" />) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-sm font-medium">{currentUser?.name?.charAt(0)}</span>
          </div>
        )}
      </Popover>
    </div>
  );
}