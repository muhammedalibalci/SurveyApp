import { useState, useEffect } from 'react';
import { Card, Radio, Button, Space, message, Result, Spin, Typography, Progress } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { Survey } from '../../types';
import { surveyService } from '../../services/surveyService';

const { Title, Text } = Typography;

export default function AnswerSurvey() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await surveyService.getSurveyForAnswering(Number(id));
        setSurvey(data);
      } catch {
        message.error('Anket yuklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

  const handleSubmit = async () => {
    if (!survey) return;

    const unanswered = survey.questions.filter(q => !(q.questionId in answers));
    if (unanswered.length > 0) {
      message.warning('Lutfen tum sorulari cevaplayin.');
      return;
    }

    setSubmitting(true);
    try {
      await surveyService.submit({
        surveyId: survey.id,
        answers: Object.entries(answers).map(([qId, optionId]) => ({
          questionId: Number(qId),
          selectedOptionId: optionId,
        })),
      });
      setSubmitted(true);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Gonderim basarisiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  if (!survey) {
    return (
      <Result
        status="404"
        title="Anket bulunamadi"
        subTitle="Bu anket mevcut degil veya erisim izniniz yok."
        extra={<Button onClick={() => navigate('/user/surveys')} icon={<ArrowLeftOutlined />}>Anketlere Don</Button>}
      />
    );
  }

  if (submitted) {
    return (
      <Result
        status="success"
        title="Anket Gonderildi!"
        subTitle="Katiliminiz icin tesekkurler."
        extra={
          <Button type="primary" onClick={() => navigate('/user/surveys')} size="large"
            style={{ borderRadius: 8, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}>
            Anketlere Don
          </Button>
        }
      />
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = survey.questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <>
      <Card style={{ borderRadius: 12, marginBottom: 24, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>{survey.title}</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>{survey.description}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Progress
              type="circle"
              percent={progressPercent}
              size={64}
              strokeColor="#fff"
              trailColor="rgba(255,255,255,0.3)"
              format={() => <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{answeredCount}/{totalQuestions}</span>}
            />
          </div>
        </div>
      </Card>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {survey.questions.map((q, index) => (
          <Card
            key={q.questionId}
            style={{
              borderRadius: 12,
              borderLeft: answers[q.questionId] ? '3px solid #52c41a' : '3px solid #d9d9d9',
              transition: 'border-color 0.3s',
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Soru {index + 1}/{totalQuestions}</Text>
              <Title level={5} style={{ margin: '4px 0 0' }}>{q.text}</Title>
            </div>
            <Radio.Group
              value={answers[q.questionId]}
              onChange={e => setAnswers(prev => ({ ...prev, [q.questionId]: e.target.value }))}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {q.options.map(opt => (
                  <Radio
                    key={opt.id}
                    value={opt.id}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                      width: '100%',
                      transition: 'all 0.2s',
                      background: answers[q.questionId] === opt.id ? '#e6f4ff' : '#fff',
                    }}
                  >
                    {opt.text}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>
        ))}
      </Space>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <Button size="large" onClick={() => navigate('/user/surveys')} icon={<ArrowLeftOutlined />}
          style={{ borderRadius: 8, height: 48, paddingInline: 32 }}>
          Iptal
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={submitting}
          icon={<SendOutlined />}
          disabled={answeredCount < totalQuestions}
          style={{
            borderRadius: 8,
            height: 48,
            paddingInline: 32,
            fontWeight: 600,
            background: answeredCount >= totalQuestions ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' : undefined,
            border: 'none',
          }}
        >
          Anketi Gonder ({answeredCount}/{totalQuestions})
        </Button>
      </div>
    </>
  );
}
