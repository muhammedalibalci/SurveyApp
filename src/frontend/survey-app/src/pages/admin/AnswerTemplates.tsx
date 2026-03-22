import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, InputNumber, Tag, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { AnswerTemplate, CreateAnswerTemplateRequest } from '../../types';
import { answerTemplateService } from '../../services/answerTemplateService';

const { Title } = Typography;

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
      message.error('Sablonlar yuklenemedi');
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
        message.success('Sablon guncellendi');
      } else {
        await answerTemplateService.create(request);
        message.success('Sablon olusturuldu');
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
      message.success('Sablon silindi');
      fetchTemplates();
    } catch {
      message.error('Sablon kullanimda oldugu icin silinemedi');
    }
  };

  const columns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Sablon Adi',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Secenekler',
      key: 'options',
      render: (_: any, record: AnswerTemplate) => (
        <Space size={[0, 4]} wrap>
          {record.options.map((o, i) => (
            <Tag key={i} color="blue">{o.text}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Secenek Sayisi',
      key: 'count',
      width: 130,
      align: 'center' as const,
      render: (_: any, r: AnswerTemplate) => (
        <Tag color={r.options.length <= 2 ? 'green' : r.options.length === 3 ? 'orange' : 'purple'}>
          {r.options.length} secenek
        </Tag>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 180,
      render: (_: any, record: AnswerTemplate) => (
        <Space>
          <Tooltip title="Duzenle">
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} size="small" type="text" />
          </Tooltip>
          <Popconfirm title="Bu sablonu silmek istediginizden emin misiniz?" okText="Evet" cancelText="Hayir" onConfirm={() => handleDelete(record.id)}>
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
          <Title level={4} style={{ margin: 0 }}>Cevap Sablonlari</Title>
          <span style={{ color: '#8c8c8c' }}>Sorularda kullanilacak cevap seceneklerini tanimlayin</span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} size="large"
          style={{ borderRadius: 8, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}>
          Yeni Sablon
        </Button>
      </div>
      <Table
        dataSource={templates}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        style={{ borderRadius: 8, overflow: 'hidden' }}
        pagination={{ pageSize: 10, showTotal: (total) => `Toplam ${total} sablon` }}
      />

      <Modal
        title={editing ? 'Sablonu Duzenle' : 'Yeni Sablon Olustur'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Kaydet"
        cancelText="Iptal"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Sablon Adi" rules={[{ required: true, message: 'Sablon adi gerekli' }]}>
            <Input placeholder="Orn: Evet/Hayir" />
          </Form.Item>
          <Form.Item label="Secenek Sayisi (2-4)">
            <InputNumber
              min={2}
              max={4}
              value={optionCount}
              onChange={(v) => setOptionCount(v || 2)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          {Array.from({ length: optionCount }).map((_, index) => (
            <Form.Item
              key={index}
              name={['options', index, 'text']}
              label={`${index + 1}. Secenek`}
              rules={[{ required: true, message: 'Secenek metni gerekli' }]}
            >
              <Input placeholder={`${index + 1}. secenek metni`} />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
}
