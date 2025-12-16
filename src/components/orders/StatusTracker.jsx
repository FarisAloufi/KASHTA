import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaHourglassHalf,
  FaCheckCircle,
  FaTruck,
  FaRegSmileBeam,
  FaTimesCircle,
} from "react-icons/fa";

// --- Helper Functions ---

const getStepStyles = (isCompleted, isCurrent) => {
  if (isCompleted) return "bg-green-600 text-white"; // Finished steps (Green)
  if (isCurrent) return "bg-blue-600 text-white";    // Active step (Blue)
  return "bg-gray-300 text-gray-600";                // Future steps (Gray)
};

// --- Main Component ---

function StatusTracker({ status }) {
  const { t } = useTranslation();

  // ✅ Move configuration inside to use 't'
  const ORDER_STEPS = [
    {
      status: "pending",
      text: t('tracker.step_pending'), // "أرسلنا طلبك... المزود شوي ويشيك عليه"
      icon: <FaHourglassHalf />,
    },
    {
      status: "confirmed",
      text: t('tracker.step_confirmed'), // "وافقوا! طلبك قيد التجهيز"
      icon: <FaCheckCircle />,
    },
    {
      status: "ready",
      text: t('tracker.step_ready'), // "حمّلنا الدباب... طلبك في الطريق!"
      icon: <FaTruck />,
    },
    {
      status: "completed",
      text: t('tracker.step_completed'), // "وصل بالسلامة. استمتع بالكشتة"
      icon: <FaRegSmileBeam />,
    },
  ];

  const CANCELLED_STATE = {
    status: "cancelled",
    text: t('tracker.step_cancelled'), // "أووه! للأسف الطلب ملغي"
    icon: <FaTimesCircle />,
  };

  // Find the index of the current status
  const currentStepIndex = ORDER_STEPS.findIndex((step) => step.status === status);

  // 1. Handle Cancelled State
  if (status === "cancelled") {
    return (
      <div className="p-4 bg-red-100 rounded-lg animate-fade-in">
        <div className="flex items-center text-red-700">
          <span className="text-3xl mr-4 rtl:ml-4 rtl:mr-0">{CANCELLED_STATE.icon}</span>
          <span className="text-lg font-bold">{CANCELLED_STATE.text}</span>
        </div>
      </div>
    );
  }

  // 2. Render Vertical Steps Timeline
  return (
    <div className="space-y-6">
      {ORDER_STEPS.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.status} className="flex items-center transition-all duration-300">
            {/* Step Icon Circle */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${getStepStyles(
                isCompleted,
                isCurrent
              )}`}
            >
              <span className="text-2xl">{step.icon}</span>
            </div>

            {/* Step Label */}
            <div className="ml-4 rtl:mr-4 rtl:ml-0">
              <h4
                className={`text-lg font-bold transition-colors duration-300 ${
                  isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {step.text}
              </h4>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusTracker;