import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DriverLiveMap from "../../components/DriverLiveMap";
import { useTripStore } from "../../store/useTripStore";
import { useRouteStore } from "../../store/useRouteStore";
import {
  verifyOtp,
  verifyPickupPhoto,
  verifyDropoffPhoto,
  verifySecurityQuestion,
  confirmPickup,
  confirmDropoff,
  updateEstimatedWaypoints,
} from "../../services/trip.service";
import { verifySecurityAnswer } from "../../services/kid.service";
import { PickingUpModal } from "../../components/modal/PickingUpModal";
import { WaitingModal } from "../../components/modal/WaitingModal";
import { OtpVerificationModal } from "../../components/modal/OtpVerificationModal";
import { PhotoVerificationModal } from "../../components/modal/PhotoVerificationModal";
import { SecurityQuestionModal } from "../../components/modal/SecurityQuestionModal";
import { OnTripModal } from "../../components/modal/OnTripModal";
import { DroppingOffModal } from "../../components/modal/DroppingOffModal";
import { DropoffPhotoModal } from "../../components/modal/DropoffPhotoModal";
import { CashPaymentModal } from "../../components/modal/CashPaymentModal";
import { confirmCashPayment, getPayment } from "../../services/payment.service";

export const InTripScreen = () => {
  const navigate = useNavigate();
  // states: picking_up -> waiting -> verifying -> in_progress -> dropping_off
  const [tripStatus, setTripStatus] = useState("picking_up");
  const [currentVerificationStep, setCurrentVerificationStep] = useState(null); // 'otp', 'photo', 'security_question', null
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const trip = useTripStore((state) => state);
  const setTripData = useTripStore((state) => state.setTrip);
  const resetTrip = useTripStore((state) => state.resetTrip);
  const route = useRouteStore((state) => state);
  const resetRoute = useRouteStore((state) => state.resetRoute);

  const rawCoords = route?.estimatedPickupCoords?.coordinates;
  const formattedPickupLocation =
    rawCoords && rawCoords.length === 2
      ? { lat: rawCoords[1], lng: rawCoords[0] }
      : undefined;

  const dropoffRawCoords = route?.estimatedDropoffCoords?.coordinates;
  const formattedDropoffLocation =
    dropoffRawCoords && dropoffRawCoords.length === 2
      ? { lat: dropoffRawCoords[1], lng: dropoffRawCoords[0] }
      : undefined;

  const [otpInput, setOtpInput] = useState("");
  const [photoInput, setPhotoInput] = useState(null);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const fileInputRef = useRef(null);

  const handleRouteCalculated = async (waypoints) => {
    if (tripStatus === "in_progress") {
      try {
        await updateEstimatedWaypoints(trip._id, { waypoints });
      } catch (err) {
        console.error("Lỗi cập nhật waypoints", err);
      }
    }
  };

  const handleArrivedAtPickup = () => {
    setTripStatus("waiting");
  };

  const handleMetKid = () => {
    setTripStatus("verifying");
    checkNextVerification(trip);
  };

  const checkNextVerification = (currentTripState) => {
    if (
      currentTripState.otp?.required &&
      currentTripState.otp?.status !== "passed"
    ) {
      setCurrentVerificationStep("otp");
      return;
    }
    if (
      currentTripState.pickupPhoto?.required &&
      currentTripState.pickupPhoto?.status !== "passed"
    ) {
      setCurrentVerificationStep("photo");
      return;
    }
    if (
      currentTripState.securityQuestion?.required &&
      currentTripState.securityQuestion?.status !== "passed"
    ) {
      setCurrentVerificationStep("security_question");
      return;
    }

    handleConfirmPickup();
  };

  const submitOtp = async () => {
    if (otpInput.length !== 6) {
      setErrorMsg("Mã OTP phải gồm 6 chữ số");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await verifyOtp(trip._id, { otp: otpInput });
      if (res?.success) {
        setTripData(res.data);
        checkNextVerification(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.message || "Lỗi xác thực OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Create a local URL for the selected image
      const url = URL.createObjectURL(e.target.files[0]);
      setPhotoInput(url);
    }
  };

  const submitPhoto = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrorMsg("Vui lòng chụp hoặc chọn ảnh");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await verifyPickupPhoto(trip._id, file);
      if (res.success) {
        setTripData(res.data);
        checkNextVerification(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || "Lỗi xác thực ảnh");
    } finally {
      setLoading(false);
    }
  };

  const submitSecurityQuestion = async () => {
    if (!securityAnswer) {
      setErrorMsg("Vui lòng nhập câu trả lời");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Verify answer using kid service
      const verifyRes = await verifySecurityAnswer(trip.kidId, securityAnswer);
      if (!verifyRes?.data?.isValid) {
        setErrorMsg("Câu trả lời không chính xác!");
        setLoading(false);
        return;
      }

      // 2. Mark trip verification as passed
      const res = await verifySecurityQuestion(trip._id, {
        answer: securityAnswer,
      });
      if (res?.success) {
        setTripData(res.data);
        checkNextVerification(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.message || "Lỗi xác thực câu hỏi bảo mật");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    setCurrentVerificationStep(null);
    setPhotoInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(true);
    try {
      const res = await confirmPickup(trip._id);
      if (res?.success) {
        setTripData(res.data);
        setTripStatus("in_progress");
      }
    } catch (err) {
      alert("Lỗi chốt chuyến: " + (err.response?.message || err.message));
      setTripStatus("waiting"); // fallback
    } finally {
      setLoading(false);
    }
  };

  const submitDropoffPhoto = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrorMsg("Vui lòng chụp hoặc chọn ảnh");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await verifyDropoffPhoto(trip._id, file);
      if (res?.success) {
        setTripData(res.data);
        setTripStatus("dropping_off");
      }
    } catch (err) {
      setErrorMsg(err.response?.message || "Lỗi xác thực ảnh trả");
    } finally {
      setLoading(false);
    }
  };

  const handleArrivedAtDropoff = () => {
    if (
      trip?.dropoffPhoto?.required &&
      trip.dropoffPhoto?.status !== "passed"
    ) {
      setTripStatus("verifying_dropoff");
      setCurrentVerificationStep("dropoff_photo");
    } else {
      setTripStatus("dropping_off");
    }
  };

  const [paymentInfo, setPaymentInfo] = useState(null);

  const handleConfirmDropoff = async () => {
    if (trip.paymentId) {
      setLoading(true);
      try {
        const paymentIdStr =
          typeof trip.paymentId === "object"
            ? trip.paymentId._id
            : trip.paymentId;
        const res = await getPayment(paymentIdStr);
        if (res?.success) {
          const paymentData = res.data;
          setPaymentInfo(paymentData);
          if (
            paymentData.method === "cash" &&
            paymentData.status !== "completed"
          ) {
            setTripStatus("collect_cash");
            setLoading(false);
            return;
          }
          await finishTrip(paymentData);
          return;
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin payment", err);
      }
      setLoading(false);
    }
    await finishTrip();
  };

  const handleCashConfirmed = async () => {
    setLoading(true);
    try {
      const paymentIdStr =
        typeof trip.paymentId === "object"
          ? trip.paymentId._id
          : trip.paymentId;
      await confirmCashPayment(paymentIdStr);
      await finishTrip(paymentInfo);
    } catch (err) {
      alert(
        "Lỗi xác nhận thu tiền mặt: " +
        (err.response?.data?.message || err.message),
      );
      setLoading(false);
    }
  };

  const finishTrip = async (fetchedPayment) => {
    setLoading(true);
    try {
      const res = await confirmDropoff(trip._id);
      if (res?.success) {
        const fare = fetchedPayment?.driverEarning || 0;
        const distance =
          trip.routeId?.estimatedDistance || trip.routeId?.actualDistance || 0;
        const duration =
          trip.routeId?.estimatedDuration || trip.routeId?.actualDuration || 0;

        resetTrip();
        resetRoute();

        navigate("/driver/summary", {
          state: { tripData: { fare, distance, duration } },
        });
      }
    } catch (err) {
      alert(
        "Lỗi xác nhận hoàn thành chuyến đi: " +
        (err.response?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f0f4f8] min-h-screen relative overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-10 left-6 right-6 z-10 flex justify-between items-center">
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <ChevronLeft size={24} className="text-gray-400" />
        </button>
        {/* <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border border-gray-100">
          <h2 className="font-bold text-sm">
            {tripStatus === "picking_up"
              ? "Đang đến điểm đón"
              : tripStatus === "waiting"
                ? "Chờ bé"
                : tripStatus === "in_progress"
                  ? "Đang chở"
                  : "Hành trình"}
          </h2>
        </div>
        <button className="px-5 py-2.5 bg-white rounded-full font-black text-red-500 shadow-md border-2 border-red-50">
          SOS
        </button> */}
      </div>

      <div className="absolute inset-0 z-0">
        <DriverLiveMap
          className="h-full w-full"
          startPointProp={
            tripStatus === "picking_up" ||
              tripStatus === "waiting" ||
              tripStatus === "in_progress"
              ? "current"
              : undefined
          }
          endPointProp={
            tripStatus === "picking_up" || tripStatus === "waiting"
              ? formattedPickupLocation
              : tripStatus === "in_progress"
                ? formattedDropoffLocation
                : undefined
          }
          onRouteCalculated={handleRouteCalculated}
        />
      </div>

      {/* Picking up state UI */}
      <AnimatePresence>
        {tripStatus === "picking_up" && (
          <PickingUpModal onArrived={handleArrivedAtPickup} />
        )}

        {/* Waiting state UI */}
        {tripStatus === "waiting" && <WaitingModal onMetKid={handleMetKid} />}

        {/* Verification Modals */}
        {tripStatus === "verifying" && currentVerificationStep === "otp" && (
          <OtpVerificationModal
            otpInput={otpInput}
            setOtpInput={setOtpInput}
            submitOtp={submitOtp}
            errorMsg={errorMsg}
            loading={loading}
          />
        )}

        {tripStatus === "verifying" && currentVerificationStep === "photo" && (
          <PhotoVerificationModal
            fileInputRef={fileInputRef}
            handlePhotoChange={handlePhotoChange}
            photoInput={photoInput}
            submitPhoto={submitPhoto}
            errorMsg={errorMsg}
            loading={loading}
          />
        )}

        {tripStatus === "verifying" &&
          currentVerificationStep === "security_question" && (
            <SecurityQuestionModal
              kidId={trip.kidId}
              securityAnswer={securityAnswer}
              setSecurityAnswer={setSecurityAnswer}
              submitSecurityQuestion={submitSecurityQuestion}
              errorMsg={errorMsg}
              loading={loading}
            />
          )}

        {/* On Trip state UI (already existing logic adapted) */}
        {tripStatus === "in_progress" && (
          <OnTripModal setTripStatus={() => handleArrivedAtDropoff()} />
        )}

        {/* Dropping off state UI */}
        {tripStatus === "dropping_off" && (
          <DroppingOffModal
            onConfirmDropoff={handleConfirmDropoff}
            loading={loading}
          />
        )}

        {/* Verifying dropoff UI */}
        {tripStatus === "verifying_dropoff" &&
          currentVerificationStep === "dropoff_photo" && (
            <DropoffPhotoModal
              fileInputRef={fileInputRef}
              handlePhotoChange={handlePhotoChange}
              photoInput={photoInput}
              submitPhoto={submitDropoffPhoto}
              errorMsg={errorMsg}
              loading={loading}
            />
          )}

        {/* Collect Cash UI */}
        {tripStatus === "collect_cash" && (
          <CashPaymentModal
            amount={paymentInfo?.amount || 0}
            onConfirm={handleCashConfirmed}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
