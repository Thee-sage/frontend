import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import { Button } from "../components/ui";
import { useAdminAuth } from '../contexts/admincontext';

// Define interface for admin data
interface AdminData {
  email: string;
  uid: string;
  [key: string]: any; // For any additional properties
}

interface WalletRequest {
  _id: string;
  uid: string;
  email: string;
  requestedAmount: number;
  status: string;
  signedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export function WalletRequests() {
  const [requests, setRequests] = useState<WalletRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Type assertion for adminData
  const { adminData } = useAdminAuth();
  const typedAdminData = adminData as AdminData | null;
  const adminEmail = typedAdminData?.email;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/wallet/requests`);
        setRequests(response.data);
      } catch (error) {
        const axiosError = error as any;
        setErrorMessage(axiosError.response?.data?.error || "Error fetching wallet requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    if (!adminEmail) {
      setErrorMessage("Admin email not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.patch(`${baseURL}/wallet/request/${requestId}/approve`, {
        adminEmail
      });
      setSuccessMessage(response.data.message);
      // Update the request in the list instead of removing it
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: 'approved', signedBy: adminEmail }
            : request
        )
      );
    } catch (error) {
      const axiosError = error as any;
      setErrorMessage(axiosError.response?.data?.error || "Error approving wallet request.");
    }
  };

  const handleReject = async (requestId: string) => {
    if (!adminEmail) {
      setErrorMessage("Admin email not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.patch(`${baseURL}/wallet/request/${requestId}/reject`, {
        adminEmail
      });
      setSuccessMessage(response.data.message);
      // Update the request in the list instead of removing it
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: 'rejected', signedBy: adminEmail }
            : request
        )
      );
    } catch (error) {
      const axiosError = error as any;
      setErrorMessage(axiosError.response?.data?.error || "Error rejecting wallet request.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Wallet Requests</h2>

      {loading && <p>Loading wallet requests...</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      {!loading && requests.length === 0 && <p>No wallet requests found.</p>}

      {!loading && requests.length > 0 && (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Requested Amount</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Signed By</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className={
                request.status === 'approved' ? 'bg-green-50' :
                request.status === 'rejected' ? 'bg-red-50' :
                ''
              }>
                <td className="py-2 px-4 border-b">{request.email}</td>
                <td className="py-2 px-4 border-b">{request.requestedAmount}</td>
                <td className="py-2 px-4 border-b capitalize">{request.status}</td>
                <td className="py-2 px-4 border-b">{request.signedBy || '-'}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApprove(request._id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleReject(request._id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}