import { useState, useEffect } from 'react';
import { Card, Radio, Button, Space, message, Result, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import type { Survey } from '../../types';
import { surveyService } from '../../services/surveyService';

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
        message.error('Failed to load survey');
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
      message.warning('Please answer all questions before submitting.');
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
      message.error(err.response?.data?.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  if (!survey) {
    return <Result status="404" title="Survey not found" subTitle="This survey may not be available." extra={<Button onClick={() => navigate('/user/surveys')}>Back to Surveys</Button>} />;
  }

  if (submitted) {
    return (
      <Result
        status="success"
        title="Survey Submitted!"
        subTitle="Thank you for completing this survey."
        extra={<Button type="primary" onClick={() => navigate('/user/surveys')}>Back to Surveys</Button>}
      />
    );
  }

  return (
    <>
      <h2>{survey.title}</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>{survey.description}</p>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {survey.questions.map((q, index) => (
          <Card key={q.questionId} title={`${index + 1}. ${q.text}`}>
            <Radio.Group
              value={answers[q.questionId]}
              onChange={e => setAnswers(prev => ({ ...prev, [q.questionId]: e.target.value }))}
            >
              <Space direction="vertical">
                {q.options.map(opt => (
                  <Radio key={opt.id} value={opt.id}>
                    {opt.text}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>
        ))}
      </Space>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button type="primary" size="large" onClick={handleSubmit} loading={submitting}>
          Submit Survey
        </Button>
        <Button style={{ marginLeft: 16 }} size="large" onClick={() => navigate('/user/surveys')}>
          Cancel
        </Button>
      </div>
    </>
  );
}
