import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QrCode, RefreshCw, AlertCircle } from "lucide-react";

const InvalidSession = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "invalid";

  const [title, setTitle] = useState("Session Invalid");
  const [message, setMessage] = useState("Please scan a valid QR code to access this service.");

  useEffect(() => {
    switch (reason) {
      case "expired":
        setTitle("Session Expired");
        setMessage("Your session has expired. Please scan a new QR code to continue.");
        break;
      case "no_session":
        setTitle("No Session Found");
        setMessage("Please scan the QR code to access this service.");
        break;
      case "invalid_token":
        setTitle("Invalid Session");
        setMessage("This link is no longer valid. Please scan a new QR code.");
        break;
      case "session_required":
        setTitle("Access Restricted");
        setMessage("This service requires a valid session. Please scan the QR code to get access.");
        break;
      default:
        setTitle("Session Invalid");
        setMessage("Please scan a valid QR code to access this service.");
    }
  }, [reason]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>

          {/* Message */}
          <p className="text-gray-400 mb-8">{message}</p>

          {/* QR Code Illustration */}
          <div className="bg-gray-900/50 rounded-2xl p-6 mb-8">
            <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center">
              <QrCode className="w-20 h-20 text-gray-800" />
            </div>
            <p className="text-sm text-gray-500">
              Scan the QR code displayed on the admin screen
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 font-medium">1</span>
              </div>
              <p className="text-gray-400">Ask the staff to show the QR code</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 font-medium">2</span>
              </div>
              <p className="text-gray-400">Scan the QR code with your phone camera</p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 font-medium">3</span>
              </div>
              <p className="text-gray-400">The app will open with a valid session</p>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="mt-8 w-full py-3 px-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-gray-300 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Photo Print Service • Secure Access
        </p>
      </div>
    </div>
  );
};

export default InvalidSession;
