import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { AnswerTemplate, CreateAnswerTemplateRequest } from '../../types';
import { answerTemplateService } from '../../services/answerTemplateService';

export default function AnswerTemplates() {
  const [templates, setTemplates] = useState<AnswerTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AnswerTemplate | null>(null);
  const [form] = Form.useForm();
  const [optionCount, setOptionCount] = useState(2);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await answerTemplateService.getAll();
      setTemplates(data);
    } catch {
      message.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const openModal = (template?: AnswerTemplate) => {
    if (template) {
      setEditing(template);
      setOptionCount(template.options.length);
      form.setFieldsValue({
        name: template.name,
        options: template.options.map(o => ({ text: o.text })),
      });
    } else {
      setEditing(null);
      setOptionCount(2);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const request: CreateAnswerTemplateRequest = {
        name: values.name,
        options: values.options.slice(0, optionCount).map((o: { text: string }, i: number) => ({
          text: o.text,
          order: i + 1,
        })),
      };

      if (editing) {
        await answerTemplateService.update(editing.id, request);
        message.success('Template updated');
      } else {
        await answerTemplateService.create(request);
        message.success('Template created');
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await answerTemplateService.delete(id);
      message.success('Template deleted');
      fetchTemplates();
    } catch {
      message.error('Failed to delete template. It may be in use.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Options',
      key: 'options',
      render: (_: any, record: AnswerTemplate) =>
        record.options.map(o => o.text).join(', '),
    },
    { title: 'Option Count', key: 'count', render: (_: any, r: AnswerTemplate) => r.options.length },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AnswerTemplate) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} size="small">Edit</Button>
          <Popconfirm title="Delete this template?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Answer Templates</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          New Template
        </Button>
      </div>
      <Table dataSource={templates} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editing ? 'Edit Template' : 'New Template'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Template Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Number of Options (2-4)">
            <InputNumber
              min={2}
              max={4}
              value={optionCount}
              onChange={(v) => setOptionCount(v || 2)}
            />
          </Form.Item>
          {Array.from({ length: optionCount }).map((_, index) => (
            <Form.Item
              key={index}
              name={['options', index, 'text']}
              label={`Option ${index + 1}`}
              rules={[{ required: true, message: 'Option text is required' }]}
            >
              <Input placeholder={`Option ${index + 1} text`} />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
}
