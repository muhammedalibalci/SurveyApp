import { useState, useEffect } from 'react';
import { Card, List, Tag, Button, message } from 'antd';
import { FormOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { UserSurvey } from '../../types';
import { surveyService } from '../../services/surveyService';

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
        message.error('Failed to load surveys');
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  return (
    <>
      <h2>My Surveys</h2>
      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
        dataSource={surveys}
        renderItem={survey => (
          <List.Item>
            <Card
              title={survey.title}
              extra={
                survey.isCompleted
                  ? <Tag icon={<CheckCircleOutlined />} color="success">Completed</Tag>
                  : <Tag color="processing">Pending</Tag>
              }
              actions={
                survey.isCompleted
                  ? undefined
                  : [
                      <Button
                        type="primary"
                        icon={<FormOutlined />}
                        onClick={() => navigate(`/user/surveys/${survey.id}/answer`)}
                      >
                        Answer Survey
                      </Button>,
                    ]
              }
            >
              <p>{survey.description}</p>
              <p>
                <strong>Period:</strong> {dayjs(survey.startDate).format('YYYY-MM-DD')} ~ {dayjs(survey.endDate).format('YYYY-MM-DD')}
              </p>
              <p><strong>Questions:</strong> {survey.questionCount}</p>
            </Card>
          </List.Item>
        )}
      />
    </>
  );
}
