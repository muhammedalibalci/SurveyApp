import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Question, AnswerTemplate } from '../../types';
import { questionService } from '../../services/questionService';
import { answerTemplateService } from '../../services/answerTemplateService';

const { Title } = Typography;

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
      message.error('Veriler yuklenemedi');
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
        message.success('Soru guncellendi');
      } else {
        await questionService.create(values);
        message.success('Soru olusturuldu');
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
      message.success('Soru silindi');
      fetchData();
    } catch {
      message.error('Soru kullanimda oldugu icin silinemedi');
    }
  };

  const columns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Soru Metni',
      dataIndex: 'text',
      key: 'text',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Cevap Sablonu',
      key: 'template',
      width: 180,
      render: (_: any, r: Question) => <Tag color="geekblue">{r.answerTemplateName}</Tag>,
    },
    {
      title: 'Secenekler',
      key: 'options',
      render: (_: any, r: Question) => (
        <Space size={[0, 4]} wrap>
          {r.options.map((o, i) => <Tag key={i}>{o.text}</Tag>)}
        </Space>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 120,
      render: (_: any, record: Question) => (
        <Space>
          <Tooltip title="Duzenle">
            <Button icon={<EditOutlined />} onClick={() => openModal(record)} size="small" type="text" />
          </Tooltip>
          <Popconfirm title="Bu soruyu silmek istediginizden emin misiniz?" okText="Evet" cancelText="Hayir" onConfirm={() => handleDelete(record.id)}>
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
          <Title level={4} style={{ margin: 0 }}>Sorular</Title>
          <span style={{ color: '#8c8c8c' }}>Anketlerde kullanilacak sorulari tanimlayin</span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} size="large"
          style={{ borderRadius: 8, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}>
          Yeni Soru
        </Button>
      </div>
      <Table
        dataSource={questions}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        style={{ borderRadius: 8, overflow: 'hidden' }}
        pagination={{ pageSize: 10, showTotal: (total) => `Toplam ${total} soru` }}
      />

      <Modal
        title={editing ? 'Soruyu Duzenle' : 'Yeni Soru Olustur'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Kaydet"
        cancelText="Iptal"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="text" label="Soru Metni" rules={[{ required: true, message: 'Soru metni gerekli' }]}>
            <Input.TextArea rows={3} placeholder="Sorunuzu yazin..." />
          </Form.Item>
          <Form.Item name="answerTemplateId" label="Cevap Sablonu" rules={[{ required: true, message: 'Sablon secimi gerekli' }]}>
            <Select placeholder="Bir cevap sablonu secin" size="large">
              {templates.map(t => (
                <Select.Option key={t.id} value={t.id}>
                  <strong>{t.name}</strong>
                  <span style={{ color: '#8c8c8c', marginLeft: 8 }}>
                    ({t.options.map(o => o.text).join(', ')})
                  </span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
