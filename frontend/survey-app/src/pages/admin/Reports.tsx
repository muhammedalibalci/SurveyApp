import { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, Modal, List, Statistic, Row, Col, Input, message, Typography, Badge, Progress } from 'antd';
import { EyeOutlined, SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SurveyListItem, SurveyReport, UserResponse } from '../../types';
import { surveyService } from '../../services/surveyService';

const { Title } = Typography;

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
      message.error('Anketler yuklenemedi');
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
      setDetailResponse(null);
      setReportModalOpen(true);
    } catch {
      message.error('Rapor yuklenemedi');
    }
  };

  const columns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Anket Basligi',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (_: any, r: SurveyListItem) => (
        <Badge status={r.isActive ? 'success' : 'error'} text={r.isActive ? 'Aktif' : 'Pasif'} />
      ),
    },
    {
      title: 'Sorular',
      dataIndex: 'questionCount',
      key: 'qcount',
      width: 90,
      align: 'center' as const,
      render: (v: number) => <Tag>{v}</Tag>,
    },
    {
      title: 'Atanan',
      dataIndex: 'assignedUserCount',
      key: 'assigned',
      width: 90,
      align: 'center' as const,
      render: (v: number) => <Tag icon={<TeamOutlined />}>{v}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      render: (_: any, record: SurveyListItem) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => viewReport(record.id)}
          type="primary"
          ghost
          style={{ borderRadius: 6 }}
        >
          Rapor Goruntule
        </Button>
      ),
    },
  ];

  const completionPercent = report ? (report.totalAssigned > 0 ? Math.round((report.totalCompleted / report.totalAssigned) * 100) : 0) : 0;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Raporlar</Title>
          <span style={{ color: '#8c8c8c' }}>Anket sonuclarini ve kullanici cevaplarini inceleyin</span>
        </div>
        <Input
          placeholder="Anket ara..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 280, borderRadius: 8 }}
          allowClear
        />
      </div>
      <Table
        dataSource={filteredSurveys}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        style={{ borderRadius: 8, overflow: 'hidden' }}
        pagination={{ pageSize: 10, showTotal: (total) => `Toplam ${total} anket` }}
      />

      <Modal
        title={<span style={{ fontSize: 18 }}>{report?.surveyTitle}</span>}
        open={reportModalOpen}
        onCancel={() => { setReportModalOpen(false); setReport(null); setDetailResponse(null); }}
        footer={null}
        width={850}
      >
        {report && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card style={{ borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Toplam Atanan" value={report.totalAssigned} prefix={<TeamOutlined />} />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Tamamlayan" value={report.totalCompleted} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: 8, textAlign: 'center' }}>
                  <Statistic title="Bekleyen" value={report.totalAssigned - report.totalCompleted} valueStyle={{ color: '#cf1322' }} prefix={<ClockCircleOutlined />} />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, color: '#8c8c8c', fontSize: 14 }}>Tamamlanma</div>
                  <Progress type="circle" percent={completionPercent} size={60} />
                </Card>
              </Col>
            </Row>

            <Title level={5} style={{ marginBottom: 12 }}>Tamamlanan Cevaplar</Title>
            <Table
              dataSource={report.completedResponses}
              rowKey="responseId"
              size="small"
              bordered
              style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}
              columns={[
                { title: 'Kullanici', render: (_: any, r: UserResponse) => <strong>{r.user.fullName}</strong> },
                { title: 'Email', render: (_: any, r: UserResponse) => r.user.email },
                { title: 'Gonderim Tarihi', render: (_: any, r: UserResponse) => dayjs(r.submittedAt).format('DD.MM.YYYY HH:mm') },
                {
                  title: '',
                  width: 150,
                  render: (_: any, r: UserResponse) => (
                    <Button size="small" type="primary" ghost onClick={() => setDetailResponse(r)} style={{ borderRadius: 6 }}>
                      Cevaplari Gor
                    </Button>
                  ),
                },
              ]}
            />

            {report.pendingUsers.length > 0 && (
              <>
                <Title level={5} style={{ marginBottom: 12 }}>Bekleyen Kullanicilar</Title>
                <List
                  size="small"
                  bordered
                  style={{ borderRadius: 8, marginBottom: 16 }}
                  dataSource={report.pendingUsers}
                  renderItem={u => (
                    <List.Item>
                      <Badge status="warning" />
                      <span style={{ marginLeft: 8 }}><strong>{u.fullName}</strong> ({u.email})</span>
                    </List.Item>
                  )}
                />
              </>
            )}

            {detailResponse && (
              <Card
                title={<span>{detailResponse.user.fullName} - Cevaplar</span>}
                style={{ borderRadius: 8, borderColor: '#1890ff' }}
                styles={{ header: { background: '#e6f4ff' } }}
              >
                {detailResponse.answers.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < detailResponse.answers.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <span><strong>{i + 1}.</strong> {a.questionText}</span>
                    <Tag color="blue">{a.selectedOptionText}</Tag>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
