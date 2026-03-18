import { Layout, Menu } from 'antd';
import {
  QuestionCircleOutlined,
  FormOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { key: '/admin/templates', icon: <UnorderedListOutlined />, label: 'Answer Templates' },
    { key: '/admin/questions', icon: <QuestionCircleOutlined />, label: 'Questions' },
    { key: '/admin/surveys', icon: <FormOutlined />, label: 'Surveys' },
    { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Reports' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#fff', padding: '16px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          Survey Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Welcome, {user?.fullName}</span>
          <Menu mode="horizontal" selectable={false} items={[
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
          ]} />
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
