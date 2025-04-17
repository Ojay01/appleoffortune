import toast from "react-hot-toast";
import { X } from "lucide-react";

export const createToastWithClose = (message: string, icon?: string) => {
  const toastId = toast(
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {message}
      </div>
      <button
        onClick={() => toast.dismiss(toastId)}
        className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
        title="Close notification"
      >
        <X size={16} color="white" />
      </button>
    </div>,
    {
      duration: 2000,
      style: {
        background: "#2E8B57",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "12px",
      },
    }
  );
};