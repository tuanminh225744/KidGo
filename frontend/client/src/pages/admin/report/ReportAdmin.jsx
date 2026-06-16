import React, { useEffect, useState } from "react";
import { List, Card, Button, Modal, Input, message } from "antd";
import { getNotifications } from "../../../services/notification.service.js";
import {
  getReportsByTripId,
  adminReply,
} from "../../../services/report.service.js";
import { io } from "socket.io-client";

const { TextArea } = Input;

export const AdminReportPage = () => {
  const [items, setItems] = useState([]); // notifications of type report_created
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNotifications({ page: 1, limit: 100 });
        const notifs = res.data?.notifications || [];
        const reports = notifs.filter((n) => n.type === "report_created");
        setItems(reports);
      } catch (err) {
        console.error(err);
      }
    };
    load();

    const s = io(
      `${import.meta.env.VITE_APP_BASE_API_URL || "http://localhost:5000"}/admin`,
      {
        path: "/socket.io",
        transports: ["websocket"],
        autoConnect: true,
      },
    );
    setSocket(s);

    s.on("connect", () => console.log("admin socket connected", s.id));
    s.on("new_report", (payload) => {
      setItems((cur) => [
        {
          _id: payload.report._id,
          title: payload.report.title,
          body: payload.report.content,
          tripId: payload.report.tripId,
          createdAt: payload.report.createdAt,
        },
        ...cur,
      ]);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const openDetails = async (item) => {
    setSelectedReport(item);
    try {
      const res = await getReportsByTripId(item.tripId);
      const reports = res.data?.reports || [];
      // find report by id
      const rpt = reports.find((r) => r._id === item._id) || reports[0] || null;
      setReportDetails(rpt);
      setReplyText(rpt?.adminAnswer || "");
    } catch (err) {
      console.error(err);
      message.error("Không thể tải chi tiết report");
    }
  };

  const submitReply = async () => {
    if (!reportDetails) return;
    try {
      await adminReply(reportDetails._id, { adminAnswer: replyText });
      message.success("Đã gửi phản hồi");
      // update local state
      setReportDetails({
        ...reportDetails,
        adminAnswer: replyText,
        status: "RESOLVED",
      });
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Gửi phản hồi thất bại");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
          Danh sách Report
        </h2>
        <List
          grid={{ gutter: 12, column: 1 }}
          dataSource={items}
          renderItem={(item) => (
            <List.Item>
              <Card>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.body}</div>
                    <div className="text-xs text-gray-400">
                      Trip: {item.tripId}
                    </div>
                  </div>
                  <div>
                    <Button type="primary" onClick={() => openDetails(item)}>
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />

        <Modal
          title="Chi tiết report"
          open={!!reportDetails}
          onCancel={() => setReportDetails(null)}
          footer={null}
          width={800}
        >
          {reportDetails && (
            <div>
              <div className="mb-2">
                <strong>Tiêu đề: </strong> {reportDetails.title}
              </div>
              <div className="mb-2">
                <strong>Nội dung: </strong>
                <div className="p-2 bg-gray-50 rounded">
                  {reportDetails.content}
                </div>
              </div>
              <div className="mb-2">
                <strong>Người gửi: </strong> {reportDetails.parentId?.fullName}
              </div>
              <div className="mb-4">
                <strong>Trạng thái: </strong> {reportDetails.status}
              </div>

              <div className="mb-2">
                <strong>Trả lời của Admin</strong>
                <TextArea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập câu trả lời..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <Button onClick={() => setReportDetails(null)}>Đóng</Button>
                <Button type="primary" onClick={submitReply}>
                  Gửi phản hồi
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminReportPage;
