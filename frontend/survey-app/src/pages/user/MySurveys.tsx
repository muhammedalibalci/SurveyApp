import { useState, useEffect } from 'react';
import { Card, List, Tag, Button, message, Typography, Empty, Progress } from 'antd';
import { FormOutlined, CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { UserSurvey } from '../../types';
import { surveyService } from '../../services/surveyService';

const { Title, Text } = Typography;

export default function MySurveys() {
  const [surveys, setSurveys] = useState<UserSurvey[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      try {
        const data = await surveyService.getMySurveys();
        setSurveys(data);
      } catch {
        message.error('Anketler yuklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const completed = surveys.filter(s => s.isCompleted).length;
  const total = surveys.length;

  return (
    <>
      {total > 0 && (
        <Card style={{ borderRadius: 12, marginBottom: 24, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>Anketlerim</Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                {completed}/{total} anket tamamlandi
              </Text>
            </div>
            <Progress
              type="circle"
              percent={Math.round((completed / total) * 100)}
              size={64}
              strokeColor="#fff"
              trailColor="rgba(255,255,255,0.3)"
              format={(p) => <span style={{ color: '#fff', fontWeight: 'bold' }}>{p}%</span>}
            />
          </div>
        </Card>
      )}

      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
        dataSource={surveys}
        locale={{ emptyText: <Empty description="Henuz atanmis anketiniz yok" /> }}
        renderItem={survey => (
          <List.Item>
            <Card
              style={{
                borderRadius: 12,
                borderTop: survey.isCompleted ? '3px solid #52c41a' : '3px solid #1890ff',
                height: '100%',
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Title level={5} style={{ margin: 0, flex: 1 }}>{survey.title}</Title>
                {survey.isCompleted
                  ? <Tag icon={<CheckCircleOutlined />} color="success">Tamamlandi</Tag>
                  : <Tag icon={<ClockCircleOutlined />} color="processing">Bekliyor</Tag>
                }
              </div>

              <Text type="secondary" style={{ display: 'block', marginBottom: 16, minHeight: 40 }}>
                {survey.description || 'Aciklama yok'}
              </Text>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">
                    {dayjs(survey.startDate).format('DD.MM.YYYY')} - {dayjs(survey.endDate).format('DD.MM.YYYY')}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <QuestionCircleOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">{survey.questionCount} soru</Text>
                </div>
              </div>

              {!survey.isCompleted && (
                <Button
                  type="primary"
                  icon={<FormOutlined />}
                  block
                  size="large"
                  onClick={() => navigate(`/user/surveys/${survey.id}/answer`)}
                  style={{
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none',
                    fontWeight: 600,
                  }}
                >
                  Anketi Doldur
                </Button>
              )}
            </Card>
          </List.Item>
        )}
      />
    </>
  );
}
