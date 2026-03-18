import { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, Modal, Descriptions, List, Statistic, Row, Col, Input, message } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SurveyListItem, SurveyReport, UserResponse } from '../../types';
import { surveyService } from '../../services/surveyService';

export default function Reports() {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<SurveyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SurveyReport | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [detailResponse, setDetailResponse] = useState<UserResponse | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await surveyService.getAll();
      setSurveys(data);
      setFilteredSurveys(data);
    } catch {
      message.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSurveys(); }, []);

  useEffect(() => {
    const filtered = surveys.filter(s =>
      s.title.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredSurveys(filtered);
  }, [searchText, surveys]);

  const viewReport = async (id: number) => {
    try {
      const data = await surveyService.getReport(id);
      setReport(data);
      setReportModalOpen(true);
    } catch {
      message.error('Failed to load report');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, r: SurveyListItem) =>
        <Tag color={r.isActive ? 'green' : 'red'}>{r.isActive ? 'Active' : 'Inactive'}</Tag>,
    },
    { title: 'Questions', dataIndex: 'questionCount', key: 'qcount' },
    { title: 'Assigned', dataIndex: 'assignedUserCount', key: 'assigned' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SurveyListItem) => (
        <Button icon={<EyeOutlined />} onClick={() => viewReport(record.id)} type="primary" size="small">
          View Report
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Survey Reports</h2>
        <Input
          placeholder="Search surveys..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table dataSource={filteredSurveys} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={`Report: ${report?.surveyTitle}`}
        open={reportModalOpen}
        onCancel={() => { setReportModalOpen(false); setReport(null); setDetailResponse(null); }}
        footer={null}
        width={800}
      >
        {report && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card><Statistic title="Total Assigned" value={report.totalAssigned} /></Card>
              </Col>
              <Col span={8}>
                <Card><Statistic title="Completed" value={report.totalCompleted} valueStyle={{ color: '#3f8600' }} /></Card>
              </Col>
              <Col span={8}>
                <Card><Statistic title="Pending" value={report.totalAssigned - report.totalCompleted} valueStyle={{ color: '#cf1322' }} /></Card>
              </Col>
            </Row>

            <h4>Completed Responses</h4>
            <Table
              dataSource={report.completedResponses}
              rowKey="responseId"
              size="small"
              columns={[
                { title: 'User', render: (_: any, r: UserResponse) => r.user.fullName },
                { title: 'Email', render: (_: any, r: UserResponse) => r.user.email },
                { title: 'Submitted At', render: (_: any, r: UserResponse) => dayjs(r.submittedAt).format('YYYY-MM-DD HH:mm') },
                {
                  title: 'Actions',
                  render: (_: any, r: UserResponse) => (
                    <Button size="small" onClick={() => setDetailResponse(r)}>View Answers</Button>
                  ),
                },
              ]}
            />

            {report.pendingUsers.length > 0 && (
              <>
                <h4 style={{ marginTop: 16 }}>Pending Users</h4>
                <List
                  size="small"
                  dataSource={report.pendingUsers}
                  renderItem={u => (
                    <List.Item>
                      {u.fullName} ({u.email})
                    </List.Item>
                  )}
                />
              </>
            )}

            {detailResponse && (
              <Card title={`Answers by ${detailResponse.user.fullName}`} style={{ marginTop: 16 }}>
                {detailResponse.answers.map((a, i) => (
                  <Descriptions key={i} bordered size="small" column={1} style={{ marginBottom: 8 }}>
                    <Descriptions.Item label="Question">{a.questionText}</Descriptions.Item>
                    <Descriptions.Item label="Answer">
                      <Tag color="blue">{a.selectedOptionText}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                ))}
              </Card>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
