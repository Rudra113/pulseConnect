/**
 * Admin Dashboard Component
 * Dashboard for admin users - manage doctors recommendations
 */

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  LogOut,
  Search,
  RefreshCw,
  Sun,
  Moon,
} from "lucide-react";
import { adminAPI } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const AdminDashboard = ({ user, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModal, setRejectModal] = useState({
    open: false,
    doctorId: null,
    doctorName: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, allRes, patientsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingDoctors(),
        adminAPI.getAllDoctors(),
        adminAPI.getAllUsers({ role: "patient" }),
      ]);
      setStats(statsRes.data);
      setPendingDoctors(pendingRes.data);
      setAllDoctors(allRes.data);
      setAllPatients(patientsRes.data || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    setActionLoading(doctorId);
    try {
      await adminAPI.approveDoctor(doctorId);
      await fetchData();
    } catch (error) {
      console.error("Error approving doctor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.doctorId) return;
    setActionLoading(rejectModal.doctorId);
    try {
      await adminAPI.rejectDoctor(rejectModal.doctorId, rejectReason);
      setRejectModal({ open: false, doctorId: null, doctorName: "" });
      setRejectReason("");
      await fetchData();
    } catch (error) {
      console.error("Error rejecting doctor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDoctors = (
    activeTab === "pending" ? pendingDoctors : allDoctors
  ).filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.specialty &&
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const filteredPatients = allPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        icon: Clock,
      },
      approved: {
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        icon: CheckCircle,
      },
      rejected: {
        color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
        icon: XCircle,
      },
      suspended: {
        color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
        icon: AlertCircle,
      },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile: Stack layout */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    Manage doctors and users
                  </p>
                </div>
              </div>
              {/* Mobile: Show theme and logout on same row */}
              <div className="flex items-center space-x-2 sm:hidden">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Desktop: Show full controls */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalPatients}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Approved Doctors
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.approvedDoctors}
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                    {stats.pendingDoctors}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-800/50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "pending"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Pending ({pendingDoctors.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "all"
                    ? "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                All Doctors ({allDoctors.length})
              </button>
              <button
                onClick={() => setActiveTab("patients")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "patients"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Patients ({allPatients.length})
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "patients"
                      ? "Search patients..."
                      : "Search doctors..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Users List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Loading...
              </p>
            </div>
          ) : activeTab === "patients" ? (
            /* Patients List */
            filteredPatients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No patients found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundColor: patient.avatarColor || "#10B981",
                          }}
                        >
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {patient.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {patient.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {patient.age && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                                Age: {patient.age}
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                patient.isOnline
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-1.5 ${
                                  patient.isOnline
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              {patient.isOnline ? "Online" : "Offline"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Registered:{" "}
                            {new Date(patient.createdAt).toLocaleDateString()}
                          </p>
                          {patient.lastSeen && !patient.isOnline && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Last seen:{" "}
                              {new Date(patient.lastSeen).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredDoctors.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === "pending"
                  ? "No pending doctor registrations"
                  : "No doctors found"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          backgroundColor: doctor.avatarColor || "#3B82F6",
                        }}
                      >
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {doctor.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {doctor.specialty && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                              {doctor.specialty}
                            </span>
                          )}
                          {doctor.experience && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {doctor.experience} years exp.
                            </span>
                          )}
                          {getStatusBadge(doctor.status)}
                        </div>
                        {doctor.qualifications && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {doctor.qualifications}
                          </p>
                        )}
                        {doctor.licenseNumber && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            License: {doctor.licenseNumber}
                          </p>
                        )}
                        {doctor.rejectionReason &&
                          doctor.status === "rejected" && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              Reason: {doctor.rejectionReason}
                            </p>
                          )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Registered:{" "}
                          {new Date(doctor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {doctor.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(doctor._id)}
                          disabled={actionLoading === doctor._id}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            setRejectModal({
                              open: true,
                              doctorId: doctor._id,
                              doctorName: doctor.name,
                            })
                          }
                          disabled={actionLoading === doctor._id}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {doctor.status === "approved" && (
                      <button
                        onClick={() =>
                          setRejectModal({
                            open: true,
                            doctorId: doctor._id,
                            doctorName: doctor.name,
                          })
                        }
                        className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reject {rejectModal.doctorName}?
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setRejectModal({
                    open: false,
                    doctorId: null,
                    doctorName: "",
                  });
                  setRejectReason("");
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
