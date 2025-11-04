import React from 'react';
import { FaHourglassHalf, FaCheckCircle, FaTruck, FaRegSmileBeam, FaTimesCircle } from 'react-icons/fa';


const steps = [
  { status: 'pending', text: 'أرسلنا طلبك... المزود يتقهوى ويشيك عليه', icon: <FaHourglassHalf /> },
  { status: 'confirmed', text: 'وافقوا! طلبك قيد التجهيز (باقي شوي)', icon: <FaCheckCircle /> },
  { status: 'ready', text: 'حمّلنا الدباب... طلبك في الطريق!', icon: <FaTruck /> },
  { status: 'completed', text: 'وصل بالسلامة. استمتع بالكشتة!', icon: <FaRegSmileBeam /> }
];


const cancelledStep = { status: 'cancelled', text: 'أووه! للأسف الطلب ملغي', icon: <FaTimesCircle /> };

function StatusTracker({ status }) {

  const currentStepIndex = steps.findIndex(step => step.status === status);

  if (status === 'cancelled') {
    return (
      <div className="p-4 bg-red-100 rounded-lg">
        <div className="flex items-center text-red-700">
          <span className="text-3xl mr-4">{cancelledStep.icon}</span>
          <span className="text-lg font-bold">{cancelledStep.text}</span>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {steps.map((step, index) => {

        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step.status} className="flex items-center">
  
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
              ${isCompleted ? 'bg-green-600 text-white' : 
                isCurrent ? 'bg-blue-600 text-white' : 
                'bg-gray-300 text-gray-600'}`}
            >
              <span className="text-2xl">{step.icon}</span>
            </div>
            

            <div className="ml-4">
              <h4 className={`text-lg font-bold 
                ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}
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