/**
 * Doctor Dashboard Component
 * Dashboard for doctor users
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  FileText,
  Search,
  Send,
  Plus,
  MessageSquare,
  RefreshCw,
  PhoneOff,
  Activity,
} from "lucide-react";
import DashboardHeader from "../components/common/DashboardHeader";
import {
  queueAPI,
  chatsAPI,
  prescriptionsAPI,
  usersAPI,
} from "../services/api";

const DoctorDashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState("queue");
  const [queueTab, setQueueTab] = useState("waiting"); // "waiting" or "completed"
  const [patientQueue, setPatientQueue] = useState([]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [stats, setStats] = useState({
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const shouldScrollToBottom = useRef(true);
  const previousMessageCount = useRef(0);

  // Notification state
  const [, setNotification] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Prescription form state
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
  });
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  // Patient history state
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Check if doctor is approved
  const isApproved = user?.isApproved && user?.status === "approved";

  // Show notification helper
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    if (isApproved) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isApproved]);

  // Auto-refresh data every 10 seconds
  useEffect(() => {
    if (!isApproved) return;
    const interval = setInterval(() => {
      fetchDataSilent();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproved, patientQueue, chats]);

  // Auto-refresh messages when in chat view
  useEffect(() => {
    let interval;
    if (activeView === "chat" && selectedChat) {
      interval = setInterval(() => {
        fetchMessages(selectedChat._id, true);
      }, 5000);
    }
    return () => interval && clearInterval(interval);
  }, [activeView, selectedChat]);

  // Scroll to bottom only when user explicitly triggers it (selecting chat or sending message)
  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      shouldScrollToBottom.current = false;
    }
    // Don't auto-scroll on background refresh - user controls scroll position
    previousMessageCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      shouldScrollToBottom.current = true;
      previousMessageCount.current = 0;
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueRes, chatsRes, statsRes, completedRes] = await Promise.all([
        queueAPI.getQueue(),
        chatsAPI.getAll(),
        queueAPI.getStats(),
        queueAPI.getCompleted(),
      ]);

      if (queueRes.success) setPatientQueue(queueRes.data);
      if (chatsRes.success) {
        setChats(chatsRes.data);
        // Don't auto-select a chat - user should click to select
      }
      if (statsRes.success) setStats(statsRes.data);
      if (completedRes.success) setCompletedPatients(completedRes.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Silent refresh without showing loading state
  const fetchDataSilent = async () => {
    try {
      const [queueRes, chatsRes, statsRes, completedRes] = await Promise.all([
        queueAPI.getQueue(),
        chatsAPI.getAll(),
        queueAPI.getStats(),
        queueAPI.getCompleted(),
      ]);

      if (queueRes.success) {
        // Check for new patients in queue
        const prevCount = patientQueue.length;
        const newCount = queueRes.data.length;
        if (newCount > prevCount) {
          showNotification(
            `🆕 New patient in queue! (${newCount - prevCount} new)`,
            "info",
          );
        }
        setPatientQueue(queueRes.data);
      }
      if (chatsRes.success) {
        // Check for new unread messages
        const prevUnread = chats.reduce(
          (sum, c) => sum + (c.unreadCount || 0),
          0,
        );
        const newUnread = chatsRes.data.reduce(
          (sum, c) => sum + (c.unreadCount || 0),
          0,
        );
        if (newUnread > prevUnread) {
          showNotification("📬 You have new messages!", "info");
        }
        setChats(chatsRes.data);
        // Don't update selectedChat here - it triggers re-fetch and scroll reset
        // The chat list UI will update automatically from chatsRes.data
      }
      if (statsRes.success) setStats(statsRes.data);
      if (completedRes.success) setCompletedPatients(completedRes.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error in silent refresh:", error);
    }
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDataSilent();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const fetchMessages = async (chatId, silent = false) => {
    try {
      const response = await chatsAPI.getMessages(chatId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await chatsAPI.sendMessage(
        selectedChat._id,
        messageInput,
      );
      if (response.success) {
        shouldScrollToBottom.current = true;
        setMessages([...messages, response.data]);
        setMessageInput("");
        // Update chat list to show latest message
        const updatedChats = chats.map((c) =>
          c._id === selectedChat._id
            ? {
                ...c,
                lastMessage: { text: messageInput.trim(), sentAt: new Date() },
              }
            : c,
        );
        setChats(updatedChats);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("Failed to send message", "error");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartConsultation = async (queueId) => {
    try {
      await queueAPI.startConsultation(queueId);
      showNotification("✅ Consultation started!", "success");
      fetchData();
      // Switch to chat view
      setActiveView("chat");
    } catch (error) {
      console.error("Error starting consultation:", error);
      showNotification("Failed to start consultation", "error");
    }
  };

  const handleCompleteConsultation = async (queueId) => {
    try {
      await queueAPI.completeConsultation(queueId, "Consultation completed");
      showNotification("✅ Consultation completed!", "success");
      fetchData();
    } catch (error) {
      console.error("Error completing consultation:", error);
      showNotification("Failed to complete consultation", "error");
    }
  };

  // Get active consultation for selected chat patient
  const getActiveConsultation = () => {
    if (!selectedChat?.participant?._id) return null;
    return patientQueue.find(
      (q) =>
        q.patientId?._id === selectedChat.participant._id &&
        q.status === "in-consultation",
    );
  };

  // Handle ending appointment from chat
  const handleEndAppointment = async () => {
    const consultation = getActiveConsultation();
    if (consultation) {
      await handleCompleteConsultation(consultation._id);
    } else {
      showNotification("No active consultation to end", "info");
    }
  };

  // Helper function to check if message is a prescription
  const isPrescription = (text) => {
    return (
      text?.includes("[PRESCRIPTION]") && text?.includes("[/PRESCRIPTION]")
    );
  };

  // Helper function to parse prescription data
  const parsePrescription = (text) => {
    const match = text.match(/\[PRESCRIPTION\]([\s\S]*?)\[\/PRESCRIPTION\]/);
    if (!match) return null;

    const content = match[1];
    const data = {};
    const lines = content.trim().split("\n");
    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length) {
        data[key.trim()] = valueParts.join(":").trim();
      }
    });
    return data;
  };

  // Render prescription card
  const renderPrescriptionCard = (prescriptionData, isOwn, timestamp) => (
    <div className={`max-w-sm ${isOwn ? "ml-auto" : "mr-auto"}`}>
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">
                Medical Prescription
              </h4>
              <p className="text-emerald-100 text-xs">From your doctor</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💊</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                Medication
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-lg">
                {prescriptionData.medication || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-emerald-200 dark:border-emerald-700">
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Dosage
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {prescriptionData.dosage || "N/A"}
              </p>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Frequency
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {prescriptionData.frequency || "N/A"}
              </p>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Duration
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {prescriptionData.duration || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-emerald-100/50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-700">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 text-right">
            {new Date(timestamp).toLocaleString([], {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </div>
  );

  // Add prescription - send as structured message AND save to database
  const handleAddPrescription = async () => {
    if (!prescriptionForm.medication.trim() || !selectedChat) return;

    try {
      setPrescriptionLoading(true);

      // First, save the prescription to the database
      const prescriptionData = {
        patientId: selectedChat.participant._id,
        items: [
          {
            medication: prescriptionForm.medication,
            dosage: prescriptionForm.dosage,
            frequency: prescriptionForm.frequency,
            duration: prescriptionForm.duration,
          },
        ],
        diagnosis: `Prescribed during consultation`,
        notes: `Prescription sent via chat`,
      };

      const prescriptionResponse =
        await prescriptionsAPI.create(prescriptionData);

      if (!prescriptionResponse.success) {
        throw new Error("Failed to save prescription to database");
      }

      // Then send prescription as a structured format in chat
      const prescriptionText = `[PRESCRIPTION]
medication:${prescriptionForm.medication}
dosage:${prescriptionForm.dosage}
frequency:${prescriptionForm.frequency}
duration:${prescriptionForm.duration}
[/PRESCRIPTION]`;

      const response = await chatsAPI.sendMessage(
        selectedChat._id,
        prescriptionText,
      );
      if (response.success) {
        shouldScrollToBottom.current = true;
        setMessages([...messages, response.data]);
        setPrescriptionForm({
          medication: "",
          dosage: "",
          frequency: "",
          duration: "",
        });
        showNotification("✅ Prescription sent and saved!", "success");
      }
    } catch (error) {
      console.error("Error sending prescription:", error);
      showNotification(error.message || "Failed to send prescription", "error");
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // Fetch patient history when a chat is selected
  const fetchPatientHistory = async (patientId) => {
    if (!patientId) return;

    try {
      setHistoryLoading(true);
      const response = await usersAPI.getPatientHistory(patientId);
      if (response.success) {
        setPatientHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching patient history:", error);
      setPatientHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch patient history when selecting a chat
  useEffect(() => {
    if (selectedChat?.participant?._id) {
      fetchPatientHistory(selectedChat.participant._id);
    } else {
      setPatientHistory(null);
    }
  }, [selectedChat]);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
      case "critical":
        return "bg-rose-100 text-rose-600 border-rose-200";
      case "medium":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "low":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const totalUnread = chats.reduce(
    (sum, chat) => sum + (chat.unreadCount || 0),
    0,
  );

  // Show pending approval message for unapproved doctors
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <DashboardHeader
          user={user}
          onLogout={onLogout}
          portalLabel="Doctor Portal"
        />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 p-8">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {user?.status === "pending"
                ? "Pending Approval"
                : user?.status === "rejected"
                  ? "Registration Rejected"
                  : "Account Suspended"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {user?.status === "pending"
                ? "Your doctor registration is being reviewed by our admin team. You will be notified once your account is approved."
                : user?.status === "rejected"
                  ? "Unfortunately, your registration was not approved. Please contact support for more information."
                  : "Your account has been suspended. Please contact support for assistance."}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-left">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Account Details:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Name: {user?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {user?.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Specialty: {user?.specialty || "Not specified"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status:{" "}
                <span className="capitalize font-medium">{user?.status}</span>
              </p>
            </div>
            <button
              onClick={onLogout}
              className="mt-6 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader
        user={user}
        onLogout={onLogout}
        portalLabel="Doctor Portal"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Refresh */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, Dr. {user?.name?.split(" ")[0] || "Doctor"}!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.specialty || "General Physician"} • Last updated:{" "}
              {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw
              className={`w-5 h-5 text-teal-600 dark:text-teal-400 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md dark:shadow-gray-900/30">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Patients Today
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md dark:shadow-gray-900/30">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.waiting}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              In Queue
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md dark:shadow-gray-900/30">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Completed
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md dark:shadow-gray-900/30">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalUnread}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Unread Chats
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveView("queue")}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeView === "queue"
                ? "bg-teal-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Patient Queue
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeView === "chat"
                ? "bg-teal-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Messages
            {totalUnread > 0 && (
              <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                {totalUnread}
              </span>
            )}
          </button>
        </div>

        {/* Patient Queue View */}
        {activeView === "queue" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Patient Queue
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {queueTab === "waiting"
                  ? "Patients waiting for consultation"
                  : "Previously consulted patients"}
              </p>

              {/* Sub-tabs for Waiting and Completed */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setQueueTab("waiting")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    queueTab === "waiting"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Waiting ({patientQueue.length})
                </button>
                <button
                  onClick={() => setQueueTab("completed")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    queueTab === "completed"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Previous Patients ({completedPatients.length})
                </button>
              </div>
            </div>

            {/* Waiting Patients Tab */}
            {queueTab === "waiting" && (
              <>
                {loading ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Loading queue...
                  </div>
                ) : patientQueue.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p>No patients in queue</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Condition
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Urgency
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Wait Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {patientQueue.map((patient) => (
                          <tr
                            key={patient._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      patient.patientId?.avatarColor ||
                                      "#0D9488",
                                  }}
                                >
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {patient.patientId?.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {patient.patientId?.age
                                      ? `${patient.patientId.age} years old`
                                      : "Age not provided"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {patient.condition}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getUrgencyColor(patient.urgency)}`}
                              >
                                {patient.urgency}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {patient.waitTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  patient.status === "in-consultation"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : patient.status === "waiting"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                                }`}
                              >
                                {patient.status === "in-consultation"
                                  ? "In Progress"
                                  : patient.status === "waiting"
                                    ? "Waiting"
                                    : patient.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {patient.status === "in-consultation" ? (
                                <button
                                  onClick={() =>
                                    handleCompleteConsultation(patient._id)
                                  }
                                  className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-600 transition shadow-md"
                                >
                                  End Consultation
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleStartConsultation(patient._id)
                                  }
                                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                                >
                                  Start Consultation
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Completed Patients Tab */}
            {queueTab === "completed" && (
              <>
                {loading ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Loading completed consultations...
                  </div>
                ) : completedPatients.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p>No completed consultations yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Condition
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Urgency
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Consulted On
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {completedPatients.map((patient) => (
                          <tr
                            key={patient._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      patient.patientId?.avatarColor ||
                                      "#0D9488",
                                  }}
                                >
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {patient.patientId?.name || "Unknown"}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {patient.patientId?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {patient.condition || "N/A"}
                              </div>
                              {patient.symptoms && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-48">
                                  {patient.symptoms}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  patient.urgency === "emergency"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                    : patient.urgency === "urgent"
                                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                      : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                }`}
                              >
                                {patient.urgency || "normal"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {patient.consultationEndedAt
                                ? new Date(
                                    patient.consultationEndedAt,
                                  ).toLocaleDateString() +
                                  " " +
                                  new Date(
                                    patient.consultationEndedAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Chat View */}
        {activeView === "chat" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No chats yet
                  </div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                        selectedChat?._id === chat._id
                          ? "bg-teal-50 dark:bg-teal-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {chat.participant?.name}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              chat.participant?.isOnline
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                            title={
                              chat.participant?.isOnline ? "Online" : "Offline"
                            }
                          ></span>
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessage?.text || "No messages yet"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {chat.lastMessage?.sentAt
                          ? new Date(
                              chat.lastMessage.sentAt,
                            ).toLocaleTimeString()
                          : ""}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window + Prescription Pad */}
            <div className="lg:col-span-2 grid lg:grid-cols-3 gap-6">
              {/* Chat Window */}
              <div
                className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 flex flex-col"
                style={{ height: "600px" }}
              >
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedChat.participant?.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getActiveConsultation() ? (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                              In Consultation
                            </span>
                          ) : (
                            <span
                              className={`flex items-center ${
                                selectedChat.participant?.isOnline
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  selectedChat.participant?.isOnline
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              {selectedChat.participant?.isOnline
                                ? "Online"
                                : "Offline"}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className={`p-2 rounded-lg transition ${showHistory ? "bg-purple-100 dark:bg-purple-900/30" : "bg-gray-100 dark:bg-gray-700"} hover:bg-purple-200 dark:hover:bg-purple-800/50`}
                          title="Patient History"
                        >
                          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </button>
                        <button
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition"
                          title="Live Chat"
                        >
                          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800/50 transition">
                          <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </button>
                        {getActiveConsultation() && (
                          <button
                            onClick={handleEndAppointment}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition shadow-md hover:shadow-lg"
                          >
                            <PhoneOff className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              End Appointment
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Patient History Panel */}
                    {showHistory && (
                      <div className="border-b border-gray-200 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/10 p-4 max-h-60 overflow-y-auto">
                        {historyLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                              Loading history...
                            </span>
                          </div>
                        ) : patientHistory ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-purple-500" />
                                Patient History with You
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {patientHistory.totalConsultations}{" "}
                                consultations,{" "}
                                {patientHistory.totalPrescriptions}{" "}
                                prescriptions
                              </span>
                            </div>

                            {/* Patient Info */}
                            {patientHistory.patient && (
                              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-2">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{
                                    backgroundColor:
                                      patientHistory.patient.avatarColor ||
                                      "#0D9488",
                                  }}
                                >
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {patientHistory.patient.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {patientHistory.patient.age
                                      ? `${patientHistory.patient.age} years old`
                                      : "Age not provided"}
                                    {patientHistory.patient.phone &&
                                      ` • ${patientHistory.patient.phone}`}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Previous Consultations */}
                            {patientHistory.consultations?.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Previous Consultations
                                </h5>
                                <div className="space-y-2">
                                  {patientHistory.consultations
                                    .slice(0, 3)
                                    .map((consult, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-white dark:bg-gray-800 rounded-lg p-2 text-xs"
                                      >
                                        <div className="flex justify-between items-start">
                                          <span className="font-medium text-gray-900 dark:text-white">
                                            {consult.condition}
                                          </span>
                                          <span
                                            className={`px-2 py-0.5 rounded-full text-xs ${
                                              consult.status === "completed"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : consult.status ===
                                                    "in-consultation"
                                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                            }`}
                                          >
                                            {consult.status}
                                          </span>
                                        </div>
                                        {consult.symptoms && (
                                          <p className="text-gray-500 dark:text-gray-400 mt-1 truncate">
                                            {consult.symptoms}
                                          </p>
                                        )}
                                        <p className="text-gray-400 dark:text-gray-500 mt-1">
                                          {new Date(
                                            consult.createdAt,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Previous Prescriptions */}
                            {patientHistory.prescriptions?.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Previous Prescriptions
                                </h5>
                                <div className="space-y-2">
                                  {patientHistory.prescriptions
                                    .slice(0, 3)
                                    .map((rx, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-white dark:bg-gray-800 rounded-lg p-2 text-xs"
                                      >
                                        <div className="flex flex-wrap gap-1">
                                          {rx.items?.map((item, itemIdx) => (
                                            <span
                                              key={itemIdx}
                                              className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded"
                                            >
                                              {item.medication} - {item.dosage}
                                            </span>
                                          ))}
                                        </div>
                                        <p className="text-gray-400 dark:text-gray-500 mt-1">
                                          {new Date(
                                            rx.createdAt,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {patientHistory.consultations?.length === 0 &&
                              patientHistory.prescriptions?.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                  No previous history with this patient
                                </p>
                              )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            Unable to load patient history
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                          <MessageSquare className="w-12 h-12 mb-3 text-gray-400" />
                          <p className="font-medium">No messages yet</p>
                          <p className="text-sm">
                            Send a message to start the conversation
                          </p>
                        </div>
                      ) : (
                        <>
                          {messages.map((msg) => {
                            const isOwn = msg.senderId?._id === user?._id;

                            // Check if this is a prescription message
                            if (isPrescription(msg.text)) {
                              const prescriptionData = parsePrescription(
                                msg.text,
                              );
                              return (
                                <div
                                  key={msg._id}
                                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                                >
                                  {renderPrescriptionCard(
                                    prescriptionData,
                                    isOwn,
                                    msg.createdAt,
                                  )}
                                </div>
                              );
                            }

                            // Regular message
                            return (
                              <div
                                key={msg._id}
                                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                    isOwn
                                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">
                                    {msg.text}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isOwn
                                        ? "text-teal-100"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !messageInput.trim()}
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-2 rounded-xl hover:from-teal-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingMessage ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                      <p>Select a chat to start messaging</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Prescription Pad */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400" />
                  Quick Prescription
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Medication
                    </label>
                    <input
                      type="text"
                      placeholder="Drug name"
                      value={prescriptionForm.medication}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          medication: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 500mg"
                      value={prescriptionForm.dosage}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          dosage: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 2x daily"
                      value={prescriptionForm.frequency}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          frequency: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 7 days"
                      value={prescriptionForm.duration}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          duration: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    onClick={handleAddPrescription}
                    disabled={
                      prescriptionLoading ||
                      !prescriptionForm.medication.trim() ||
                      !selectedChat
                    }
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prescriptionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    {prescriptionLoading ? "Sending..." : "Send Prescription"}
                  </button>
                  {!selectedChat && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      Select a patient chat to send prescription
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
