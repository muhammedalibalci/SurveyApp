import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
  QuestionCircleOutlined,
  FormOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { key: '/admin/templates', icon: <UnorderedListOutlined />, label: 'Cevap Sablonlari' },
    { key: '/admin/questions', icon: <QuestionCircleOutlined />, label: 'Sorular' },
    { key: '/admin/surveys', icon: <FormOutlined />, label: 'Anketler' },
    { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Raporlar' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: 'linear-gradient(180deg, #001529 0%, #002140 100%)' }}
        theme="dark"
      >
        <div style={{
          padding: '20px 16px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 8,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <FileTextOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <Text strong style={{ color: '#fff', fontSize: 16 }}>Survey Admin</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderRight: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          zIndex: 1,
        }}>
          <Text strong style={{ fontSize: 16 }}>
            {menuItems.find(m => m.key === location.pathname)?.label || 'Dashboard'}
          </Text>
          <Dropdown menu={{
            items: [
              { key: 'user', label: user?.email, disabled: true },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Cikis Yap', onClick: handleLogout, danger: true },
            ],
          }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }} icon={<UserOutlined />} />
              <Text>{user?.fullName}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
