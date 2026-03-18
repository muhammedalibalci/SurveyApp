import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Question, AnswerTemplate } from '../../types';
import { questionService } from '../../services/questionService';
import { answerTemplateService } from '../../services/answerTemplateService';

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<AnswerTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [q, t] = await Promise.all([questionService.getAll(), answerTemplateService.getAll()]);
      setQuestions(q);
      setTemplates(t);
    } catch {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (question?: Question) => {
    if (question) {
      setEditing(question);
      form.setFieldsValue({ text: question.text, answerTemplateId: question.answerTemplateId });
    } else {
      setEditing(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await questionService.update(editing.id, values);
        message.success('Question updated');
      } else {
        await questionService.create(values);
        message.success('Question created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      if (err.response?.data?.message) message.error(err.response.data.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await questionService.delete(id);
      message.success('Question deleted');
      fetchData();
    } catch {
      message.error('Failed to delete question. It may be in use.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Question Text', dataIndex: 'text', key: 'text' },
    {
      title: 'Answer Template',
      key: 'template',
      render: (_: any, r: Question) => <Tag color="blue">{r.answerTemplateName}</Tag>,
    },
    {
      title: 'Options',
      key: 'options',
      render: (_: any, r: Question) => r.options.map(o => o.text).join(', '),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Question) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} size="small">Edit</Button>
          <Popconfirm title="Delete this question?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Questions</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>New Question</Button>
      </div>
      <Table dataSource={questions} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editing ? 'Edit Question' : 'New Question'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="text" label="Question Text" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="answerTemplateId" label="Answer Template" rules={[{ required: true }]}>
            <Select placeholder="Select an answer template">
              {templates.map(t => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name} ({t.options.map(o => o.text).join(', ')})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
