import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ message = "Authenticating..." }) => (
  <div className="fixed inset-0 bg-green-50 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-center space-y-4">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
      <p className="text-xl font-medium text-green-800">{message}</p>
    </div>
  </div>
);