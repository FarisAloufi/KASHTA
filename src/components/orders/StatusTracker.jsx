import React from "react";
import {
  FaHourglassHalf,
  FaCheckCircle,
  FaTruck,
  FaRegSmileBeam,
  FaTimesCircle,
} from "react-icons/fa";

// --- Configuration Data ---

// Defined steps for the order lifecycle
const ORDER_STEPS = [
  {
    status: "pending",
    text: "أرسلنا طلبك... المزود شوي ويشيك عليه",
    icon: <FaHourglassHalf />,
  },
  {
    status: "confirmed",
    text: "وافقوا! طلبك قيد التجهيز (باقي شوي)",
    icon: <FaCheckCircle />,
  },
  {
    status: "ready",
    text: "حمّلنا الدباب... طلبك في الطريق!",
    icon: <FaTruck />,
  },
  {
    status: "completed",
    text: "وصل بالسلامة. استمتع بالكشتة",
    icon: <FaRegSmileBeam />,
  },
];

// Specific configuration for cancelled state
const CANCELLED_STATE = {
  status: "cancelled",
  text: "أووه! للأسف الطلب ملغي",
  icon: <FaTimesCircle />,
};

// --- Helper Functions ---

/**
 * Determines the CSS classes for a step circle based on its state.
 * @param {boolean} isCompleted - True if the step is finished.
 * @param {boolean} isCurrent - True if this is the active step.
 */
const getStepStyles = (isCompleted, isCurrent) => {
  if (isCompleted) return "bg-green-600 text-white"; // Finished steps (Green)
  if (isCurrent) return "bg-blue-600 text-white";    // Active step (Blue)
  return "bg-gray-300 text-gray-600";                // Future steps (Gray)
};

// --- Main Component ---

function StatusTracker({ status }) {
  // Find the index of the current status in our steps array
  const currentStepIndex = ORDER_STEPS.findIndex((step) => step.status === status);

  // 1. Handle Cancelled State explicitly (Guard Clause)
  if (status === "cancelled") {
    return (
      <div className="p-4 bg-red-100 rounded-lg animate-fade-in">
        <div className="flex items-center text-red-700">
          <span className="text-3xl mr-4">{CANCELLED_STATE.icon}</span>
          <span className="text-lg font-bold">{CANCELLED_STATE.text}</span>
        </div>
      </div>
    );
  }

  // 2. Render Vertical Steps Timeline
  return (
    <div className="space-y-6">
      {ORDER_STEPS.map((step, index) => {
        // Logic: A step is completed if its index is less than the current status index
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
            <div className="ml-4">
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