import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Switch, Space, Popconfirm, message, Tag, Transfer, Typography, Tooltip, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SurveyListItem, Question, User, Survey, CreateSurveyRequest } from '../../types';
import { surveyService } from '../../services/surveyService';
import { questionService } from '../../services/questionService';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function Surveys() {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [form] = Form.useForm();
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, q, u] = await Promise.all([
        surveyService.getAll(),
        questionService.getAll(),
        surveyService.getUsers(),
      ]);
      setSurveys(s);
      setQuestions(q);
      setUsers(u.filter(u => u.role === 'User'));
    } catch {
      message.error('Veriler yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = async (surveyItem?: SurveyListItem) => {
    if (surveyItem) {
      const full = await surveyService.getById(surveyItem.id);
      setEditing(full);
      setSelectedQuestionIds(full.questions.map(q => String(q.questionId)));
      setSelectedUserIds(full.assignedUsers.map(u => String(u.id)));
      form.setFieldsValue({
        title: full.title,
        description: full.description,
        dateRange: [dayjs(full.startDate), dayjs(full.endDate)],
        isActive: full.isActive,
      });
    } else {
      setEditing(null);
      setSelectedQuestionIds([]);
      setSelectedUserIds([]);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (selectedQuestionIds.length === 0) {
        message.error('En az bir soru secmelisiniz');
        return;
      }
      const request: CreateSurveyRequest = {
        title: values.title,
        description: values.description || '',
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        isActive: values.isActive ?? true,
        questions: selectedQuestionIds.map((id, index) => ({
          questionId: Number(id),
          order: index + 1,
        })),
        assignedUserIds: selectedUserIds.map(Number),
      };

      if (editing) {
        await surveyService.update(editing.id, request);
        message.success('Anket guncellendi');
      } else {
        await surveyService.create(request);
        message.success('Anket olusturuldu');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      if (err.response?.data?.message) message.error(err.response.data.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await surveyService.delete(id);
      message.success('Anket silindi');
      fetchData();
    } catch {
      message.error('Anket silinemedi');
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
      title: 'Tarih Araligi',
      key: 'dates',
      width: 220,
      render: (_: any, r: SurveyListItem) => (
        <Space>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <span>{dayjs(r.startDate).format('DD.MM.YYYY')} - {dayjs(r.endDate).format('DD.MM.YYYY')}</span>
        </Space>
      ),
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
      title: 'Kullanicilar',
      dataIndex: 'assignedUserCount',
      key: 'ucount',
      width: 110,
      align: 'center' as const,
      render: (v: number) => <Tag icon={<UserOutlined />}>{v}</Tag>,
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 120,
      render: (_: any, record: SurveyListItem) => (
        <Space>
          <Tooltip title="Duzenle">
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} size="small" type="text" />
          </Tooltip>
          <Popconfirm title="Bu anketi silmek istediginizden emin misiniz?" okText="Evet" cancelText="Hayir" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="Sil">
              <Button icon={<DeleteOutlined />} danger size="small" type="text" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Anketler</Title>
          <span style={{ color: '#8c8c8c' }}>Anketleri olusturun, duzenleyin ve kullanicilara atayin</span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} size="large"
          style={{ borderRadius: 8, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}>
          Yeni Anket
        </Button>
      </div>
      <Table
        dataSource={surveys}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        style={{ borderRadius: 8, overflow: 'hidden' }}
        pagination={{ pageSize: 10, showTotal: (total) => `Toplam ${total} anket` }}
      />

      <Modal
        title={editing ? 'Anketi Duzenle' : 'Yeni Anket Olustur'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Kaydet"
        cancelText="Iptal"
        width={720}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Anket Basligi" rules={[{ required: true, message: 'Baslik gerekli' }]}>
            <Input placeholder="Anket basligini girin" />
          </Form.Item>
          <Form.Item name="description" label="Aciklama">
            <Input.TextArea rows={3} placeholder="Anket aciklamasi (opsiyonel)" />
          </Form.Item>
          <Space size="large" style={{ width: '100%' }}>
            <Form.Item name="dateRange" label="Tarih Araligi" rules={[{ required: true, message: 'Tarih secimi gerekli' }]}>
              <RangePicker format="DD.MM.YYYY" />
            </Form.Item>
            <Form.Item name="isActive" label="Durum" valuePropName="checked">
              <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
            </Form.Item>
          </Space>

          <Form.Item label="Sorulari Secin">
            <Transfer
              dataSource={questions.map(q => ({ key: String(q.id), title: q.text }))}
              titles={['Mevcut Sorular', 'Secilen Sorular']}
              targetKeys={selectedQuestionIds}
              onChange={(keys) => setSelectedQuestionIds(keys as string[])}
              render={item => item.title || ''}
              listStyle={{ width: 300, height: 250 }}
            />
          </Form.Item>

          <Form.Item label="Kullanicilari Ata">
            <Select
              mode="multiple"
              placeholder="Anketi dolduracak kullanicilari secin"
              value={selectedUserIds.map(Number)}
              onChange={(vals: number[]) => setSelectedUserIds(vals.map(String))}
              style={{ width: '100%' }}
              size="large"
            >
              {users.map(u => (
                <Select.Option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
