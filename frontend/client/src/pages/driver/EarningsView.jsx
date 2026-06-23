import { useState, useEffect } from 'react';
import { getDriverMeEarnings } from '../../services/driver.service';
import { Wallet, DollarSign, ArrowRightLeft, CreditCard } from 'lucide-react';

export default function EarningsView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ actualEarnings: 0, cashReceived: 0 });

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await getDriverMeEarnings({ period: 'month' });
        if (res?.data) {
          setStats({
            actualEarnings: res.data.actualEarnings || 0,
            cashReceived: res.data.cashReceived || 0
          });
        }
      } catch (error) {
        console.error('Lỗi tải thu nhập:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const diff = stats.actualEarnings - stats.cashReceived;
  const isPositive = diff >= 0;
  const diffAmount = Math.abs(diff);

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <div className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-[#1D7C45]">Thu nhập tháng này</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải dữ liệu thu nhập...</p>
        ) : (
          <>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng thu nhập</p>
                <p className="text-2xl font-bold text-[#1D7C45]">{stats.actualEarnings.toLocaleString()}đ</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#1D7C45]" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tiền mặt đã thu</p>
                <p className="text-2xl font-bold text-gray-800">{stats.cashReceived.toLocaleString()}đ</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gray-500" />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isPositive ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-3 mb-2">
                {isPositive ? (
                  <CreditCard className="w-6 h-6 text-blue-600" />
                ) : (
                  <ArrowRightLeft className="w-6 h-6 text-red-600" />
                )}
                <h3 className={`font-bold ${isPositive ? 'text-blue-800' : 'text-red-800'}`}>
                  {isPositive ? 'Tiền sẽ được chuyển khoản' : 'Tiền phải nộp lên hệ thống'}
                </h3>
              </div>
              <p className={`text-sm mb-3 ${isPositive ? 'text-blue-600' : 'text-red-600'}`}>
                {isPositive 
                  ? 'Hệ thống sẽ thanh toán số tiền này cho bạn vào cuối tháng.'
                  : 'Tiền mặt đã thu lớn hơn tổng thu nhập. Bạn cần nộp lại khoản dư này.'}
              </p>
              <p className={`text-3xl font-bold ${isPositive ? 'text-blue-700' : 'text-red-700'}`}>
                {diffAmount.toLocaleString()}đ
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
