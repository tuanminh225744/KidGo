import { Routes, Route } from 'react-router-dom';
import SetKidAndType from './SetKidAndType.jsx';
import SetLocation from './SetLocation.jsx';
import SetDateTime from './SetDateTime.jsx';
import SelectDriver from './SelectDriver.jsx';
import ConfirmBooking from './ConfirmBooking.jsx';
import PaymentScreen from './PaymentScreen.jsx';
import React from 'react';

export default function Booking() {
  return (
    <Routes>
      <Route index element={<SetKidAndType />} />
      <Route path="location" element={<SetLocation />} />
      <Route path="datetime" element={<SetDateTime />} />
      <Route path="driver" element={<SelectDriver />} />
      <Route path="confirm" element={<ConfirmBooking />} />
      <Route path="payment" element={<PaymentScreen />} />
    </Routes>
  );
}
