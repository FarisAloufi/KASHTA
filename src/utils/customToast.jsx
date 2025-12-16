import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, X, Loader2 } from 'lucide-react';

const ToastContainer = ({ t, icon, title, message, borderColor, bgColor }) => (
  <div
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] border-l-8 ${borderColor}`}
  >
    <div className="flex-1 w-0 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
             {icon}
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-bold text-gray-900">
            {title}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {message}
          </p>
        </div>
      </div>
    </div>
    <div className="flex border-l border-gray-200">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none hover:bg-gray-50 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  </div>
);


export const showSuccess = (message) => {
  toast.custom((t) => (
    <ToastContainer 
      t={t}
      icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
      title="ناجح!"
      message={message}
      borderColor="border-green-500"
      bgColor="bg-green-100"
    />
  ), { duration: 4000 });
};

export const showError = (message) => {
  toast.custom((t) => (
    <ToastContainer 
      t={t}
      icon={<XCircle className="h-6 w-6 text-red-600" />}
      title="خطأ!"
      message={message}
      borderColor="border-red-500"
      bgColor="bg-red-100"
    />
  ), { duration: 5000 });
};

export const showLoading = (message) => {
  return toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl p-4 flex items-center gap-4 border border-main-bg/10`}>
        <Loader2 className="animate-spin text-main-accent h-6 w-6" />
        <p className="text-sm font-bold text-main-text">{message}</p>
    </div>
  ), { duration: Infinity, id: 'loading-toast' });
};

export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};