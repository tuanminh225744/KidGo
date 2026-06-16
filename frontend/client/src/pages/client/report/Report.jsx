import React from "react";
import { Button, Form, Input, message } from "antd";
import { createReport } from "../../../services/report.service.js";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const { TextArea } = Input;

export const ReportPage = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const tripId = location.state?.tripId;

  const onFinish = async (values) => {
    if (!tripId) {
      message.error("Không tìm thấy thông tin chuyến đi. Vui lòng quay lại.");
      return;
    }
    try {
      await createReport({ ...values, tripId });
      message.success("Đã gửi phản hồi thành công");
      form.resetFields();
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Gửi report thất bại");
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-24 bg-surface min-h-screen">
      <header className="px-5 py-4 flex items-center gap-4 bg-white sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-on-surface" />
        </button>
        <h1 className="text-xl font-bold text-on-surface">Gửi phản hồi</h1>
      </header>
      
      <main className="px-5 pt-6 max-w-2xl mx-auto w-full">
        {!tripId && (
          <div className="bg-orange-50 text-orange-600 p-4 rounded-xl mb-4 text-sm font-medium">
            Lỗi: Không xác định được chuyến đi. Vui lòng chọn phản hồi từ màn hình Chi tiết chuyến đi.
          </div>
        )}
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={!tripId}>

        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Tiêu đề là bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: "Nội dung là bắt buộc" }]}
        >
          <TextArea rows={6} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Gửi report
          </Button>
        </Form.Item>
      </Form>
      </main>
    </div>
  );
};

export default ReportPage;
