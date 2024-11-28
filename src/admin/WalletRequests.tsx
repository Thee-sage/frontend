import { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../utils";
import styles from "./styles/WalletRequests.module.css"
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
    <>
    <h2 className={styles.title}>Wallet Requests</h2>
      <div className={styles.container}>
   
    
        {/* Loading state */}
        {loading && (
          <div className={styles.loading}>
            Loading wallet requests...
          </div>
        )}
    
        {/* Error message */}
        {errorMessage && (
          <div className={`${styles.message} ${styles.error}`}>
            {errorMessage}
          </div>
        )}
    
        {/* Success message */}
        {successMessage && (
          <div className={`${styles.message} ${styles.success}`}>
            {successMessage}
          </div>
        )}
    
        {/* Show "No requests" message when not loading and no requests */}
        {!loading && requests.length === 0 && (
          <div className={styles.message}>
            No wallet requests found.
          </div>
        )}
    
        {/* Table only shows when we have requests and not loading */}
        {!loading && requests.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Email</th>
                <th className={styles.tableHeader}>Amount</th>
                <th className={styles.tableHeader}>Status</th>
                <th className={styles.tableHeader}>Signed By</th>
                <th className={styles.tableHeader}>Date</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request._id}
                  className={
                    request.status === 'approved'
                      ? styles.approvedRow
                      : request.status === 'rejected'
                      ? styles.rejectedRow
                      : styles.pendingRow
                  }
                >
                  <td className={styles.tableCell}>{request.email}</td>
                  <td className={`${styles.tableCell} ${styles.amountCell}`}>
                    {request.requestedAmount.toLocaleString()}
                  </td>
                  <td className={`${styles.tableCell} ${styles.statusCell} ${
                    request.status === 'pending'
                      ? styles.statusPending
                      : request.status === 'approved'
                      ? styles.statusApproved
                      : styles.statusRejected
                  }`}>
                    {request.status}
                  </td>
                  <td className={`${styles.tableCell} ${styles.signedByCell}`}>
                    {request.signedBy || '-'}
                  </td>
                  <td className={`${styles.tableCell} ${styles.dateCell}`}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className={styles.tableCell}>
                    {request.status === "pending" && (
                      <div className={styles.actionContainer}>
                        <button 
                          onClick={() => handleApprove(request._id)}
                          className={styles.approveButton}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(request._id)}
                          className={styles.rejectButton}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </>
    );
}