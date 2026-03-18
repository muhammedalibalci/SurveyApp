import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Switch, Space, Popconfirm, message, Tag, Transfer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SurveyListItem, Question, User, Survey, CreateSurveyRequest } from '../../types';
import { surveyService } from '../../services/surveyService';
import { questionService } from '../../services/questionService';

const { RangePicker } = DatePicker;

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
      message.error('Failed to load data');
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
        message.error('Please select at least one question');
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
        message.success('Survey updated');
      } else {
        await surveyService.create(request);
        message.success('Survey created');
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
      message.success('Survey deleted');
      fetchData();
    } catch {
      message.error('Failed to delete survey');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Date Range',
      key: 'dates',
      render: (_: any, r: SurveyListItem) =>
        `${dayjs(r.startDate).format('YYYY-MM-DD')} ~ ${dayjs(r.endDate).format('YYYY-MM-DD')}`,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, r: SurveyListItem) =>
        <Tag color={r.isActive ? 'green' : 'red'}>{r.isActive ? 'Active' : 'Inactive'}</Tag>,
    },
    { title: 'Questions', dataIndex: 'questionCount', key: 'qcount' },
    { title: 'Assigned Users', dataIndex: 'assignedUserCount', key: 'ucount' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SurveyListItem) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} size="small">Edit</Button>
          <Popconfirm title="Delete this survey?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Surveys</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>New Survey</Button>
      </div>
      <Table dataSource={surveys} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editing ? 'Edit Survey' : 'New Survey'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dateRange" label="Date Range" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Select Questions">
            <Transfer
              dataSource={questions.map(q => ({ key: String(q.id), title: q.text }))}
              titles={['Available', 'Selected']}
              targetKeys={selectedQuestionIds}
              onChange={(keys) => setSelectedQuestionIds(keys as string[])}
              render={item => item.title || ''}
              listStyle={{ width: 280, height: 300 }}
            />
          </Form.Item>

          <Form.Item label="Assign Users">
            <Select
              mode="multiple"
              placeholder="Select users to assign"
              value={selectedUserIds.map(Number)}
              onChange={(vals: number[]) => setSelectedUserIds(vals.map(String))}
              style={{ width: '100%' }}
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
