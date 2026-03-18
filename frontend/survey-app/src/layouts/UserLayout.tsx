import { Layout, Avatar, Dropdown, Typography } from 'antd';
import { LogoutOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function UserLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 32px',
        boxShadow: '0 2px 8px rgba(24,144,255,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FileTextOutlined style={{ fontSize: 18, color: '#fff' }} />
          </div>
          <Text strong style={{ color: '#fff', fontSize: 18 }}>Anketlerim</Text>
        </div>
        <Dropdown menu={{
          items: [
            { key: 'user', label: user?.email, disabled: true },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Cikis Yap', onClick: handleLogout, danger: true },
          ],
        }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#fff' }}>{user?.fullName}</Text>
            <Avatar size="small" style={{ background: 'rgba(255,255,255,0.3)' }} icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Header>
      <Content style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
