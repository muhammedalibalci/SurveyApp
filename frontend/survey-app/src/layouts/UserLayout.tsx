import { Layout, Menu } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content } = Layout;

export default function UserLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>My Surveys</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#fff' }}>{user?.fullName}</span>
          <Menu theme="dark" mode="horizontal" selectable={false} items={[
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
          ]} />
        </div>
      </Header>
      <Content style={{ padding: '24px 48px' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: 360 }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
