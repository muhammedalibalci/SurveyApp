import { useState } from 'react';
import { Form, Input, Button, message, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const user = await authService.login(values.email, values.password);
      login(user);
      message.success('Giris basarili!');
      navigate(user.role === 'Admin' ? '/admin/templates' : '/user/surveys');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Giris basarisiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f7',
    }}>
      <div style={{
        width: 380,
        padding: '48px 40px',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.1)',
      }}>
        <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: '#007AFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1d1d1f' }}>Survey App</Title>
          <Text style={{ color: '#86868b', fontSize: 15 }}>Hesabiniza giris yapin</Text>
        </Space>

        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Gecerli bir email girin' }]}>
            <Input prefix={<MailOutlined style={{ color: '#86868b' }} />} placeholder="Email" style={{ height: 48, fontSize: 15 }} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Sifrenizi girin' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#86868b' }} />} placeholder="Sifre" style={{ height: 48, fontSize: 15 }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 48, fontSize: 16, fontWeight: 600 }}>
              Giris Yap
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
          <Text style={{ color: '#86868b', fontSize: 13 }}>Demo: admin@survey.com / Admin123!</Text>
        </div>
      </div>
    </div>
  );
}
