import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Card, Tag, List, Statistic, Row, Col, Input, message, Typography, Badge, Progress, Tabs, Empty, Tooltip } from 'antd';
import {
  ArrowLeftOutlined, SearchOutlined, CheckCircleOutlined, ClockCircleOutlined,
  TeamOutlined, BarChartOutlined, UserOutlined,
  CalendarOutlined, RiseOutlined
} from '@ant-design/icons';
import { Pie, Column, Bar } from '@ant-design/charts';
import dayjs from 'dayjs';
import type { SurveyListItem, SurveyReport, UserResponse, UserAnswer } from '../../types';
import { surveyService } from '../../services/surveyService';

const { Title, Text } = Typography;

// ── Yardımcı fonksiyonlar ──────────────────────────────────────

interface QuestionStat {
  questionId: number;
  questionText: string;
  options: { option: string; count: number; percent: number }[];
  totalAnswers: number;
}

function buildQuestionStats(responses: UserResponse[]): QuestionStat[] {
  const allAnswers = responses.flatMap(r => r.answers);
  const grouped = new Map<number, { text: string; options: Map<string, number> }>();

  for (const a of allAnswers) {
    if (!grouped.has(a.questionId)) {
      grouped.set(a.questionId, { text: a.questionText, options: new Map() });
    }
    const q = grouped.get(a.questionId)!;
    q.options.set(a.selectedOptionText, (q.options.get(a.selectedOptionText) || 0) + 1);
  }

  return Array.from(grouped.entries()).map(([qId, data]) => {
    const totalAnswers = Array.from(data.options.values()).reduce((s, v) => s + v, 0);
    const options = Array.from(data.options.entries())
      .map(([option, count]) => ({ option, count, percent: Math.round((count / totalAnswers) * 100) }))
      .sort((a, b) => b.count - a.count);
    return { questionId: qId, questionText: data.text, options, totalAnswers };
  });
}

function buildTimelineData(responses: UserResponse[]): { date: string; count: number }[] {
  const grouped = new Map<string, number>();
  for (const r of responses) {
    const day = dayjs(r.submittedAt).format('DD MMM');
    grouped.set(day, (grouped.get(day) || 0) + 1);
  }
  return Array.from(grouped.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => dayjs(a.date, 'DD MMM').valueOf() - dayjs(b.date, 'DD MMM').valueOf());
}

// ── Renk paleti ────────────────────────────────────────────────

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

// ── Ana Bileşen ────────────────────────────────────────────────

export default function Reports() {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<SurveyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SurveyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [view, setView] = useState<'list' | 'detail'>('list');

  // ── Veri yükleme ──

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
    setReportLoading(true);
    setView('detail');
    try {
      const data = await surveyService.getReport(id);
      setReport(data);
    } catch {
      message.error('Rapor yuklenemedi');
      setView('list');
    } finally {
      setReportLoading(false);
    }
  };

  const goBack = () => {
    setView('list');
    setReport(null);
  };

  // ── Hesaplamalar ──

  const completionPercent = report
    ? (report.totalAssigned > 0 ? Math.round((report.totalCompleted / report.totalAssigned) * 100) : 0)
    : 0;

  const questionStats = useMemo(
    () => report ? buildQuestionStats(report.completedResponses) : [],
    [report]
  );

  const timelineData = useMemo(
    () => report ? buildTimelineData(report.completedResponses) : [],
    [report]
  );

  // ════════════════════════════════════════════════════════════════
  //  GÖRÜNÜM A: Anket Listesi
  // ════════════════════════════════════════════════════════════════

  if (view === 'list') {
    const columns = [
      { title: '#', dataIndex: 'id', key: 'id', width: 60 },
      {
        title: 'Anket Basligi',
        dataIndex: 'title',
        key: 'title',
        render: (text: string) => <strong>{text}</strong>,
      },
      {
        title: 'Tarih Araligi',
        key: 'dates',
        width: 220,
        render: (_: unknown, r: SurveyListItem) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(r.startDate).format('DD.MM.YYYY')} — {dayjs(r.endDate).format('DD.MM.YYYY')}
          </Text>
        ),
      },
      {
        title: 'Durum',
        key: 'status',
        width: 100,
        align: 'center' as const,
        render: (_: unknown, r: SurveyListItem) => (
          <Badge status={r.isActive ? 'success' : 'error'} text={r.isActive ? 'Aktif' : 'Pasif'} />
        ),
      },
      {
        title: 'Sorular',
        dataIndex: 'questionCount',
        key: 'qcount',
        width: 80,
        align: 'center' as const,
        render: (v: number) => <Tag>{v}</Tag>,
      },
      {
        title: 'Tamamlanma',
        key: 'completion',
        width: 180,
        render: (_: unknown, r: SurveyListItem) => {
          const pct = r.assignedUserCount > 0
            ? Math.round((r.responseCount / r.assignedUserCount) * 100)
            : 0;
          return (
            <Tooltip title={`${r.responseCount} / ${r.assignedUserCount} kullanici`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Progress
                  percent={pct}
                  size="small"
                  style={{ flex: 1, margin: 0 }}
                  strokeColor={pct === 100 ? '#52c41a' : pct >= 50 ? '#1890ff' : '#faad14'}
                />
                <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {r.responseCount}/{r.assignedUserCount}
                </Text>
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: '',
        key: 'actions',
        width: 160,
        render: (_: unknown, record: SurveyListItem) => (
          <Button
            icon={<BarChartOutlined />}
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

    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Raporlar</Title>
            <Text type="secondary">Anket sonuclarini ve kullanici cevaplarini inceleyin</Text>
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
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  GÖRÜNÜM B: Anket Rapor Detayı
  // ════════════════════════════════════════════════════════════════

  return (
    <div>
      {/* Üst Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={goBack} style={{ borderRadius: 6 }}>
          Geri
        </Button>
        <div>
          <Title level={4} style={{ margin: 0 }}>{report?.surveyTitle || 'Yukleniyor...'}</Title>
          <Text type="secondary">Detayli anket raporu</Text>
        </div>
      </div>

      {reportLoading ? (
        <Card loading style={{ borderRadius: 12 }} />
      ) : report ? (
        <Tabs
          defaultActiveKey="overview"
          type="card"
          items={[
            // ─── Sekme 1: Genel Bakış ───
            {
              key: 'overview',
              label: <span><RiseOutlined /> Genel Bakis</span>,
              children: <OverviewTab report={report} completionPercent={completionPercent} timelineData={timelineData} />,
            },
            // ─── Sekme 2: Soru Analizi ───
            {
              key: 'questions',
              label: <span><BarChartOutlined /> Soru Analizi</span>,
              children: <QuestionAnalysisTab questionStats={questionStats} />,
            },
            // ─── Sekme 3: Katılımcılar ───
            {
              key: 'participants',
              label: <span><UserOutlined /> Katilimcilar ({report.totalAssigned})</span>,
              children: <ParticipantsTab report={report} />,
            },
          ]}
        />
      ) : null}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Sekme 1: Genel Bakış
// ════════════════════════════════════════════════════════════════

function OverviewTab({ report, completionPercent, timelineData }: {
  report: SurveyReport;
  completionPercent: number;
  timelineData: { date: string; count: number }[];
}) {
  const pieData = [
    { type: 'Tamamlayan', value: report.totalCompleted },
    { type: 'Bekleyen', value: report.totalAssigned - report.totalCompleted },
  ];

  return (
    <>
      {/* İstatistik Kartları */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card
            style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 13 }}>Toplam Atanan</Text>}
              value={report.totalAssigned}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 13 }}>Tamamlayan</Text>}
              value={report.totalCompleted}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{ borderRadius: 12, borderLeft: '4px solid #faad14' }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 13 }}>Bekleyen</Text>}
              value={report.totalAssigned - report.totalCompleted}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            style={{ borderRadius: 12, borderLeft: '4px solid #722ed1' }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Tamamlanma Orani</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Progress
                type="circle"
                percent={completionPercent}
                size={52}
                strokeColor={completionPercent === 100 ? '#52c41a' : '#722ed1'}
                strokeWidth={8}
              />
              <Text style={{ fontSize: 28, fontWeight: 700 }}>%{completionPercent}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Grafikler */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Card title={<span><TeamOutlined /> Katilim Dagilimi</span>} style={{ borderRadius: 12, height: '100%' }}>
            {report.totalAssigned > 0 ? (
              <Pie
                data={pieData}
                angleField="value"
                colorField="type"
                radius={0.85}
                innerRadius={0.55}
                color={['#52c41a', '#faad14']}
                label={{
                  text: 'value',
                  style: { fontWeight: 'bold', fontSize: 14 },
                }}
                legend={{ position: 'bottom' }}
                statistic={{
                  title: { content: 'Toplam', style: { fontSize: '13px', color: '#8c8c8c' } },
                  content: { content: `${report.totalAssigned}`, style: { fontSize: '24px', fontWeight: '700' } },
                }}
                height={280}
              />
            ) : (
              <Empty description="Henuz katilimci yok" />
            )}
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card title={<span><CalendarOutlined /> Gonderim Zaman Cizelgesi</span>} style={{ borderRadius: 12, height: '100%' }}>
            {timelineData.length > 0 ? (
              <Column
                data={timelineData}
                xField="date"
                yField="count"
                color="#1890ff"
                columnWidthRatio={0.5}
                label={{
                  text: 'count',
                  position: 'top',
                  style: { fill: '#595959', fontWeight: 'bold' },
                }}
                axis={{
                  y: { title: 'Yanit Sayisi', tickInterval: 1 },
                  x: { title: 'Tarih' },
                }}
                height={280}
              />
            ) : (
              <Empty description="Henuz yanit yok" />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  Sekme 2: Soru Analizi
// ════════════════════════════════════════════════════════════════

function QuestionAnalysisTab({ questionStats }: { questionStats: QuestionStat[] }) {
  if (questionStats.length === 0) {
    return <Empty description="Henuz analiz icin yeterli veri yok" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {questionStats.map((q, idx) => (
        <Col xs={24} lg={12} key={q.questionId}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Tag color={COLORS[idx % COLORS.length]} style={{ minWidth: 28, textAlign: 'center', marginTop: 2 }}>
                  {idx + 1}
                </Tag>
                <Text strong style={{ flex: 1, whiteSpace: 'normal', lineHeight: '1.4' }}>
                  {q.questionText}
                </Text>
              </div>
            }
            extra={<Tag>{q.totalAnswers} yanit</Tag>}
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Bar
              data={q.options}
              xField="count"
              yField="option"
              color={COLORS[idx % COLORS.length]}
              label={{
                text: (d: { count: number; percent: number }) => `${d.count} (%${d.percent})`,
                position: 'right',
                style: { fill: '#595959', fontWeight: 'bold', fontSize: 12 },
              }}
              axis={{
                x: { title: 'Secim Sayisi', tickInterval: 1 },
                y: { title: false },
              }}
              height={Math.max(120, q.options.length * 48)}
              style={{ maxWidth: 40 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// ════════════════════════════════════════════════════════════════
//  Sekme 3: Katılımcılar
// ════════════════════════════════════════════════════════════════

function ParticipantsTab({ report }: { report: SurveyReport }) {
  const expandedRowRender = (record: UserResponse) => (
    <div style={{ padding: '8px 16px', background: '#fafafa', borderRadius: 8 }}>
      {record.answers.map((a: UserAnswer, i: number) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < record.answers.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}
        >
          <Text>
            <Text strong style={{ color: '#1890ff', marginRight: 8 }}>{i + 1}.</Text>
            {a.questionText}
          </Text>
          <Tag color="blue" style={{ marginLeft: 12, flexShrink: 0 }}>{a.selectedOptionText}</Tag>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Tamamlayan Kullanıcılar */}
      <Card
        title={
          <span>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            Tamamlayan Kullanicilar ({report.completedResponses.length})
          </span>
        }
        style={{ borderRadius: 12, marginBottom: 16 }}
      >
        {report.completedResponses.length > 0 ? (
          <Table
            dataSource={report.completedResponses}
            rowKey="responseId"
            size="small"
            bordered
            style={{ borderRadius: 8, overflow: 'hidden' }}
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
            }}
            pagination={report.completedResponses.length > 10 ? { pageSize: 10 } : false}
            columns={[
              {
                title: 'Kullanici',
                render: (_: unknown, r: UserResponse) => (
                  <div>
                    <Text strong>{r.user.fullName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.user.email}</Text>
                  </div>
                ),
              },
              {
                title: 'Gonderim Tarihi',
                width: 180,
                render: (_: unknown, r: UserResponse) => (
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {dayjs(r.submittedAt).format('DD.MM.YYYY HH:mm')}
                  </Text>
                ),
              },
              {
                title: 'Cevap Sayisi',
                width: 120,
                align: 'center' as const,
                render: (_: unknown, r: UserResponse) => <Tag color="blue">{r.answers.length} cevap</Tag>,
              },
            ]}
          />
        ) : (
          <Empty description="Henuz tamamlayan kullanici yok" />
        )}
      </Card>

      {/* Bekleyen Kullanıcılar */}
      {report.pendingUsers.length > 0 && (
        <Card
          title={
            <span>
              <ClockCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
              Bekleyen Kullanicilar ({report.pendingUsers.length})
            </span>
          }
          style={{ borderRadius: 12 }}
        >
          <List
            size="small"
            dataSource={report.pendingUsers}
            renderItem={u => (
              <List.Item>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge status="warning" />
                  <div>
                    <Text strong>{u.fullName}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>({u.email})</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}
    </>
  );
}
