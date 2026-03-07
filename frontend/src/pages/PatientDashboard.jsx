/**
 * Patient Dashboard Component
 * Dashboard for patient users
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  Pill,
  Activity,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Stethoscope,
  Send,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  FileText,
} from "lucide-react";
import DashboardHeader from "../components/common/DashboardHeader";
import {
  medicationsAPI,
  appointmentsAPI,
  symptomsAPI,
  usersAPI,
  queueAPI,
  chatsAPI,
} from "../services/api";

const PatientDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("medications");
  const [symptomText, setSymptomText] = useState("");
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [myConsultations, setMyConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symptomAnalysis, setSymptomAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Chat state
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const shouldScrollToBottom = useRef(true);
  const previousMessageCount = useRef(0);

  // Notification state
  const [, setNotification] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Consultation booking state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [consultationForm, setConsultationForm] = useState({
    condition: "",
    age: "",
    symptoms: "",
    symptomDuration: "",
    urgency: "medium",
    consultationType: "general",
    consultationMode: "chat",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Medication tracker state
  const [showAddMedForm, setShowAddMedForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [medForm, setMedForm] = useState({
    medicineName: "",
    dailyDosage: 1,
    totalQuantity: 30,
    remainingStock: 30,
    refillThreshold: 5,
    notes: "",
  });
  const [medLoading, setMedLoading] = useState(false);

  // Section refs for smooth scrolling
  const consultRef = useRef(null);
  const symptomsRef = useRef(null);
  const medicationsRef = useRef(null);
  const contentRef = useRef(null); // Ref for tab content container
  const addMedFormRef = useRef(null); // Ref for add medication form

  // Note: sectionRefs removed - refs are used directly where needed

  // Handle tab click with smooth scroll
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Scroll to content area after tab change
    setTimeout(() => {
      if (contentRef.current) {
        const yOffset = -20; // Small offset from top
        const y =
          contentRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 50);
  };

  // Calculate stats
  const adherenceRate = 87; // This would be calculated from medication tracking data
  const activePrescriptions = medications.length;

  // Find next refill
  const getNextRefillDays = () => {
    const medsNeedingRefill = medications.filter((m) => m.needsRefill);
    if (medsNeedingRefill.length > 0) {
      return Math.min(...medsNeedingRefill.map((m) => m.daysRemaining));
    }
    return medications.length > 0
      ? Math.min(...medications.map((m) => m.daysRemaining))
      : 0;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 15 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDataSilent();
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh messages when in chat view
  useEffect(() => {
    let interval;
    if (activeTab === "messages" && selectedChat) {
      interval = setInterval(() => {
        fetchMessages(selectedChat._id, true);
      }, 5000);
    }
    return () => interval && clearInterval(interval);
  }, [activeTab, selectedChat]);

  // Scroll to bottom only when new messages arrive or user sends a message
  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      shouldScrollToBottom.current = false;
    }
    // Check if new messages actually arrived during silent refresh
    if (
      messages.length > previousMessageCount.current &&
      previousMessageCount.current > 0
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousMessageCount.current = messages.length;
  }, [messages]);

  // Show notification helper
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medsRes, apptsRes, doctorsRes, consultRes, chatsRes] =
        await Promise.all([
          medicationsAPI.getAll(),
          appointmentsAPI.getAll({ upcoming: "true" }),
          usersAPI.getDoctors(),
          queueAPI.getMyConsultations
            ? queueAPI.getMyConsultations()
            : Promise.resolve({ success: true, data: [] }),
          chatsAPI.getAll(),
        ]);

      if (medsRes.success) setMedications(medsRes.data);
      if (apptsRes.success) setAppointments(apptsRes.data);
      if (doctorsRes.success) setDoctors(doctorsRes.data);
      if (consultRes.success) setMyConsultations(consultRes.data);
      if (chatsRes.success) setChats(chatsRes.data);
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
      const [medsRes, consultRes, chatsRes] = await Promise.all([
        medicationsAPI.getAll(),
        queueAPI.getMyConsultations
          ? queueAPI.getMyConsultations()
          : Promise.resolve({ success: true, data: [] }),
        chatsAPI.getAll(),
      ]);

      if (medsRes.success) setMedications(medsRes.data);
      if (consultRes.success) {
        // Check for status changes (doctor started consultation)
        const prevInProgress = myConsultations.filter(
          (c) => c.status === "in-consultation",
        ).length;
        const newInProgress = consultRes.data.filter(
          (c) => c.status === "in-consultation",
        ).length;
        if (newInProgress > prevInProgress) {
          showNotification(
            "🎉 A doctor has started your consultation! Check Messages.",
            "success",
          );
        }
        setMyConsultations(consultRes.data);
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
        // Update selectedChat with fresh data (for online status updates)
        if (selectedChat) {
          const updatedSelectedChat = chatsRes.data.find(
            (c) => c._id === selectedChat._id,
          );
          if (updatedSelectedChat) {
            setSelectedChat(updatedSelectedChat);
          }
        }
      }
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

  // Chat functions
  const fetchMessages = async (chatId, silent = false) => {
    try {
      if (!silent) setChatLoading(true);
      const response = await chatsAPI.getMessages(chatId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (!silent) setChatLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    shouldScrollToBottom.current = true;
    previousMessageCount.current = 0;
    await fetchMessages(chat._id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await chatsAPI.sendMessage(
        selectedChat._id,
        messageInput.trim(),
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

  // Start chat with doctor from consultation
  const handleStartChat = async (doctorId) => {
    try {
      setChatLoading(true);
      const response = await chatsAPI.create(doctorId);
      if (response.success) {
        // Refresh chats and switch to messages tab
        const chatsRes = await chatsAPI.getAll();
        if (chatsRes.success) {
          setChats(chatsRes.data);
          const newChat = chatsRes.data.find(
            (c) => c.participant?._id === doctorId,
          );
          if (newChat) {
            setSelectedChat(newChat);
            await fetchMessages(newChat._id);
          }
        }
        setActiveTab("messages");
        showNotification(
          "Chat started! You can now message your doctor.",
          "success",
        );
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      showNotification("Failed to start chat", "error");
    } finally {
      setChatLoading(false);
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

  // Add medication from prescription
  const [addingFromPrescription, setAddingFromPrescription] = useState(null);
  const [addedPrescriptions, setAddedPrescriptions] = useState(new Set());

  const handleAddMedicationFromPrescription = async (
    prescriptionData,
    messageId,
  ) => {
    if (!prescriptionData.medication) return;

    try {
      setAddingFromPrescription(messageId);

      // Parse frequency to get daily dosage (pills per day)
      // e.g., "twice daily" = 2, "3 times a day" = 3, "once daily" = 1
      let dailyDosage = 1;
      const freq = (prescriptionData.frequency || "").toLowerCase();
      if (
        freq.includes("once") ||
        freq.includes("1x") ||
        freq.includes("1 time")
      ) {
        dailyDosage = 1;
      } else if (
        freq.includes("twice") ||
        freq.includes("2x") ||
        freq.includes("2 time")
      ) {
        dailyDosage = 2;
      } else if (
        freq.includes("three") ||
        freq.includes("3x") ||
        freq.includes("3 time")
      ) {
        dailyDosage = 3;
      } else if (
        freq.includes("four") ||
        freq.includes("4x") ||
        freq.includes("4 time")
      ) {
        dailyDosage = 4;
      } else {
        const freqMatch = freq.match(/(\d+)/);
        if (freqMatch) dailyDosage = parseInt(freqMatch[1]) || 1;
      }

      // Parse duration to get number of days
      const durationMatch = prescriptionData.duration?.match(/(\d+)/);
      const durationDays = durationMatch ? parseInt(durationMatch[1]) : 30;
      const totalQuantity = dailyDosage * durationDays;

      const medicationData = {
        medicineName: prescriptionData.medication,
        dailyDosage: dailyDosage,
        totalQuantity: totalQuantity,
        remainingStock: totalQuantity,
        refillThreshold: Math.max(5, Math.floor(totalQuantity * 0.2)),
        notes: `Dosage: ${prescriptionData.dosage || "N/A"} | Frequency: ${prescriptionData.frequency || "N/A"} | Duration: ${prescriptionData.duration || "N/A"}`,
      };

      const response = await medicationsAPI.create(medicationData);
      if (response.success) {
        setMedications([...medications, response.data]);
        setAddedPrescriptions((prev) => new Set([...prev, messageId]));
        showNotification("Medication added to your tracker!", "success");
      }
    } catch (error) {
      console.error("Error adding medication from prescription:", error);
      showNotification(
        error.response?.data?.message || "Failed to add medication",
        "error",
      );
    } finally {
      setAddingFromPrescription(null);
    }
  };

  // Render prescription card
  const renderPrescriptionCard = (
    prescriptionData,
    isOwn,
    timestamp,
    messageId,
  ) => (
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

          {/* Add to Medications Button - only for received prescriptions */}
          {!isOwn &&
            (addedPrescriptions.has(messageId) ? (
              <div className="w-full mt-2 flex items-center justify-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium py-2.5 px-4 rounded-xl border-2 border-green-300 dark:border-green-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Added to Medications</span>
              </div>
            ) : (
              <button
                onClick={() =>
                  handleAddMedicationFromPrescription(
                    prescriptionData,
                    messageId,
                  )
                }
                disabled={addingFromPrescription === messageId}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {addingFromPrescription === messageId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to My Medications</span>
                  </>
                )}
              </button>
            ))}
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

  const totalUnread = chats.reduce(
    (sum, chat) => sum + (chat.unreadCount || 0),
    0,
  );

  const handleBookConsultation = async () => {
    if (!selectedDoctor || !consultationForm.condition.trim()) return;

    try {
      setBookingLoading(true);
      const response = await queueAPI.joinQueue({
        doctorId: selectedDoctor._id,
        ...consultationForm,
      });

      if (response.success) {
        setBookingSuccess(true);
        showNotification(
          "✅ Consultation booked! A chat has been created with your doctor.",
          "success",
        );
        setConsultationForm({
          condition: "",
          age: "",
          symptoms: "",
          symptomDuration: "",
          urgency: "medium",
          consultationType: "general",
          consultationMode: "chat",
        });
        setSelectedDoctor(null);
        await fetchData(); // Refresh all data including chats

        setTimeout(() => setBookingSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error booking consultation:", error);
      showNotification(
        error.response?.data?.message || "Failed to book consultation",
        "error",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // Medication CRUD handlers
  const handleAddMedication = async () => {
    if (!medForm.medicineName.trim()) return;
    try {
      setMedLoading(true);
      const response = await medicationsAPI.create(medForm);
      if (response.success) {
        setMedications([...medications, response.data]);
        setMedForm({
          medicineName: "",
          dailyDosage: 1,
          totalQuantity: 30,
          remainingStock: 30,
          refillThreshold: 5,
          notes: "",
        });
        setShowAddMedForm(false);
      }
    } catch (error) {
      console.error("Error adding medication:", error);
      alert(error.response?.data?.message || "Failed to add medication");
    } finally {
      setMedLoading(false);
    }
  };

  const handleUpdateMedication = async () => {
    if (!editingMed || !medForm.medicineName.trim()) return;
    try {
      setMedLoading(true);
      const response = await medicationsAPI.update(editingMed._id, medForm);
      if (response.success) {
        setMedications(
          medications.map((m) =>
            m._id === editingMed._id ? response.data : m,
          ),
        );
        setEditingMed(null);
        setMedForm({
          medicineName: "",
          dailyDosage: 1,
          totalQuantity: 30,
          remainingStock: 30,
          refillThreshold: 5,
          notes: "",
        });
      }
    } catch (error) {
      console.error("Error updating medication:", error);
      alert(error.response?.data?.message || "Failed to update medication");
    } finally {
      setMedLoading(false);
    }
  };

  const handleDeleteMedication = async (medId) => {
    if (!window.confirm("Are you sure you want to delete this medication?"))
      return;
    try {
      const response = await medicationsAPI.delete(medId);
      if (response.success) {
        setMedications(medications.filter((m) => m._id !== medId));
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
      alert(error.response?.data?.message || "Failed to delete medication");
    }
  };

  const startEditMedication = (med) => {
    setEditingMed(med);
    setMedForm({
      medicineName: med.medicineName,
      dailyDosage: med.dailyDosage,
      totalQuantity: med.totalQuantity,
      remainingStock: med.remainingStock,
      refillThreshold: med.refillThreshold || 5,
      notes: med.notes || "",
    });
    setShowAddMedForm(false);
  };

  const cancelMedForm = () => {
    setShowAddMedForm(false);
    setEditingMed(null);
    setMedForm({
      medicineName: "",
      dailyDosage: 1,
      totalQuantity: 30,
      remainingStock: 30,
      refillThreshold: 5,
      notes: "",
    });
  };

  const handleAnalyzeSymptoms = async () => {
    if (!symptomText.trim()) return;

    try {
      setAnalyzing(true);
      const response = await symptomsAPI.analyze(symptomText);
      if (response.success) {
        setSymptomAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const nextRefillDays = getNextRefillDays();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Refresh */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.name?.split(" ")[0] || "Patient"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your health overview for today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
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
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-gray-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {adherenceRate}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Adherence Rate
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Great job this week!
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-gray-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {nextRefillDays}d
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Next Refill
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {medications.find((m) => m.needsRefill)?.medicineName ||
                "All stocked"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-gray-900/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {activePrescriptions}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Active Prescriptions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All medications tracked
            </p>
          </div>
        </div>
        {/* Tabs with smooth scroll - Sticky */}
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: "medications", label: "My Medications", icon: Pill },
              { id: "consult", label: "Book Consultation", icon: Stethoscope },
              {
                id: "messages",
                label: "Messages",
                icon: MessageSquare,
                badge: totalUnread,
              },
              { id: "symptoms", label: "Symptoms", icon: AlertCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-5 py-3 rounded-xl font-medium transition whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-200 dark:shadow-teal-900/50"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span
                      className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full ${
                        activeTab === tab.id
                          ? "bg-white text-teal-600"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Tab Content Container */}
        <div ref={contentRef} className="mt-2">
          {/* Medications Tab - Full Medicine Tracker */}
          {activeTab === "medications" && (
            <div ref={medicationsRef} className="space-y-6 scroll-mt-6">
              {/* Header with Add Button */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-white">
                    <h2 className="text-2xl font-bold mb-1">
                      Medicine Tracker
                    </h2>
                    <p className="text-teal-100">
                      Track and manage all your medications in one place
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddMedForm(true);
                      setEditingMed(null);
                      // Auto scroll to form after it renders
                      setTimeout(() => {
                        if (addMedFormRef.current) {
                          addMedFormRef.current.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }, 100);
                    }}
                    className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 px-5 py-3 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-gray-700 transition shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Medication</span>
                  </button>
                </div>
              </div>

              {/* Add/Edit Form */}
              {(showAddMedForm || editingMed) && (
                <div
                  ref={addMedFormRef}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-gray-900/30 border-2 border-teal-100 dark:border-teal-800 scroll-mt-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {editingMed ? "Edit Medication" : "Add New Medication"}
                    </h3>
                    <button
                      onClick={cancelMedForm}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={medForm.medicineName}
                        onChange={(e) =>
                          setMedForm({
                            ...medForm,
                            medicineName: e.target.value,
                          })
                        }
                        placeholder="e.g., Aspirin, Metformin"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Daily Dosage
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={medForm.dailyDosage}
                        onChange={(e) =>
                          setMedForm({
                            ...medForm,
                            dailyDosage: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={medForm.totalQuantity}
                        onChange={(e) =>
                          setMedForm({
                            ...medForm,
                            totalQuantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Remaining Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={medForm.remainingStock}
                        onChange={(e) =>
                          setMedForm({
                            ...medForm,
                            remainingStock: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Refill Alert (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={medForm.refillThreshold}
                        onChange={(e) =>
                          setMedForm({
                            ...medForm,
                            refillThreshold: parseInt(e.target.value) || 5,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (optional)
                      </label>
                      <textarea
                        value={medForm.notes}
                        onChange={(e) =>
                          setMedForm({ ...medForm, notes: e.target.value })
                        }
                        placeholder="Add any notes about this medication..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-20 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={cancelMedForm}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={
                        editingMed
                          ? handleUpdateMedication
                          : handleAddMedication
                      }
                      disabled={medLoading || !medForm.medicineName.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {medLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>
                            {editingMed ? "Update" : "Add"} Medication
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Medications List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Your Medications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {medications.length} medication
                        {medications.length !== 1 ? "s" : ""} tracked
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Stocked
                      </span>
                      <span className="flex items-center text-rose-600 ml-4">
                        <span className="w-3 h-3 bg-rose-500 rounded-full mr-2"></span>
                        Low
                      </span>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Loading medications...
                  </div>
                ) : medications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Pill className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      No medications yet
                    </p>
                    <p className="text-gray-500 mb-4">
                      Start tracking your medications to never miss a dose
                    </p>
                    <button
                      onClick={() => setShowAddMedForm(true)}
                      className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Your First Medication</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {medications.map((med) => {
                      const stockPercent =
                        (med.remainingStock / med.totalQuantity) * 100;
                      const isLow = med.needsRefill;

                      return (
                        <div
                          key={med._id}
                          className="p-6 hover:bg-gray-50 transition group"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Med Info */}
                            <div className="flex items-start space-x-4">
                              <div
                                className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-md ${
                                  isLow
                                    ? "bg-gradient-to-br from-red-500 to-orange-500"
                                    : "bg-gradient-to-br from-emerald-500 to-green-500"
                                }`}
                              >
                                <Pill className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-xl">
                                  {med.medicineName}
                                </h4>
                                <p className="text-base text-gray-600 mt-1">
                                  {med.dailyDosage}x daily • {med.daysRemaining}{" "}
                                  days remaining
                                </p>
                                {med.notes && (
                                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                    {med.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Stock Bar */}
                            <div className="flex-1 max-w-sm">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-base font-medium text-gray-700">
                                  Stock Level
                                </span>
                                <span
                                  className={`text-xl font-bold ${isLow ? "text-red-600" : "text-emerald-600"}`}
                                >
                                  {med.remainingStock} / {med.totalQuantity}
                                </span>
                              </div>
                              <div className="w-full bg-gray-300 rounded-full h-5 overflow-hidden shadow-inner">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isLow
                                      ? "bg-gradient-to-r from-red-600 to-orange-500"
                                      : "bg-gradient-to-r from-emerald-500 to-green-400"
                                  }`}
                                  style={{
                                    width: `${Math.min(stockPercent, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span
                                  className={`text-sm font-semibold ${isLow ? "text-red-600" : "text-emerald-600"}`}
                                >
                                  {Math.round(stockPercent)}% remaining
                                </span>
                                <span className="text-sm font-medium text-gray-600">
                                  {med.daysRemaining} days left
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 lg:opacity-0 lg:group-hover:opacity-100 transition">
                              <button
                                onClick={() => startEditMedication(med)}
                                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedication(med._id)}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Low Stock Alert */}
                          {isLow && (
                            <div className="mt-4 flex items-center space-x-3 text-red-700 bg-red-100 border-2 border-red-300 px-4 py-3 rounded-xl animate-pulse">
                              <AlertCircle className="w-6 h-6" />
                              <span className="text-base font-bold">
                                ⚠️ Low stock - Refill soon!
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consult Tab - Book Consultation with Doctors */}
          {activeTab === "consult" && (
            <div ref={consultRef} className="space-y-6 scroll-mt-6">
              {/* Success Message */}
              {bookingSuccess && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-700 dark:text-green-300">
                    Consultation request submitted successfully! The doctor will
                    attend to you soon.
                  </span>
                </div>
              )}

              {/* Available Doctors */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-gray-900/30">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Available Doctors
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a doctor to book a consultation
                </p>

                {loading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading doctors...
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Stethoscope className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p>No doctors available at the moment</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor._id}
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                          selectedDoctor?._id === doctor._id
                            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
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
                            <p className="text-sm text-teal-600 dark:text-teal-400">
                              {doctor.specialty || "General Physician"}
                            </p>
                            {doctor.experience && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {doctor.experience} years exp.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consultation Form - Shows when doctor is selected */}
              {selectedDoctor && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-gray-900/30">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Book Consultation
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        with Dr. {selectedDoctor.name} (
                        {selectedDoctor.specialty || "General"})
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDoctor(null)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Main Concern / Condition *
                      </label>
                      <input
                        type="text"
                        value={consultationForm.condition}
                        onChange={(e) =>
                          setConsultationForm({
                            ...consultationForm,
                            condition: e.target.value,
                          })
                        }
                        placeholder="e.g., Persistent headache, Skin rash, Fever"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Age *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="150"
                        value={consultationForm.age}
                        onChange={(e) =>
                          setConsultationForm({
                            ...consultationForm,
                            age: e.target.value,
                          })
                        }
                        placeholder="Enter your age"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Describe Your Symptoms
                      </label>
                      <textarea
                        value={consultationForm.symptoms}
                        onChange={(e) =>
                          setConsultationForm({
                            ...consultationForm,
                            symptoms: e.target.value,
                          })
                        }
                        placeholder="Describe your symptoms in detail..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        How long have you had these symptoms?
                      </label>
                      <select
                        value={consultationForm.symptomDuration}
                        onChange={(e) =>
                          setConsultationForm({
                            ...consultationForm,
                            symptomDuration: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select duration</option>
                        <option value="Less than 24 hours">
                          Less than 24 hours
                        </option>
                        <option value="1-3 days">1-3 days</option>
                        <option value="4-7 days">4-7 days</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="More than 2 weeks">
                          More than 2 weeks
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Urgency Level
                      </label>
                      <select
                        value={consultationForm.urgency}
                        onChange={(e) =>
                          setConsultationForm({
                            ...consultationForm,
                            urgency: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="low">Low - General checkup</option>
                        <option value="medium">Medium - Some discomfort</option>
                        <option value="high">
                          High - Significant pain/concern
                        </option>
                        <option value="critical">Critical - Emergency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Consultation Type
                      </label>
                      <select
                        value={consultationForm.consultationType}
                        onChange={(e) =>
                          setConsultationForm({
                            ...consultationForm,
                            consultationType: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="general">General Consultation</option>
                        <option value="follow-up">Follow-up Visit</option>
                        <option value="specialist">
                          Specialist Consultation
                        </option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Consultation Mode
                      </label>
                      <div className="flex space-x-3">
                        <div className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                          <MessageSquare className="w-5 h-5" />
                          <span>Live Chat</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBookConsultation}
                    disabled={
                      bookingLoading || !consultationForm.condition.trim()
                    }
                    className="w-full mt-6 bg-teal-600 text-white py-4 rounded-xl hover:bg-teal-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {bookingLoading
                      ? "Submitting..."
                      : "Submit Consultation Request"}
                  </button>
                </div>
              )}

              {/* Your Upcoming Appointments */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-gray-900/30">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-teal-600 dark:text-teal-400" />
                  Your Consultations & Appointments
                </h3>

                {loading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Loading...
                  </div>
                ) : myConsultations.length === 0 &&
                  appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg font-medium">
                      No consultations or appointments yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Select a doctor above to book your first consultation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show Consultations */}
                    {myConsultations.map((consultation) => (
                      <div
                        key={consultation._id}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-gray-900/30 transition bg-white dark:bg-gray-800"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                              style={{
                                backgroundColor:
                                  consultation.doctorId?.avatarColor ||
                                  "#14B8A6",
                              }}
                            >
                              {consultation.doctorId?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "D"}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                Dr. {consultation.doctorId?.name}
                              </h4>
                              <p className="text-teal-600 dark:text-teal-400 font-medium">
                                {consultation.doctorId?.specialty ||
                                  "General Physician"}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {consultation.condition}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                consultation.status === "waiting"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                  : consultation.status === "in-consultation"
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                    : consultation.status === "completed"
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {consultation.status === "waiting"
                                ? "Pending"
                                : consultation.status === "in-consultation"
                                  ? "In Progress"
                                  : consultation.status
                                      ?.charAt(0)
                                      .toUpperCase() +
                                    consultation.status?.slice(1)}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleStartChat(consultation.doctorId?._id)
                                }
                                className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800/50 transition"
                                title="Chat with Doctor"
                              >
                                <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-gray-100 gap-3">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <Calendar className="w-5 h-5 text-teal-600" />
                            <span className="font-medium">
                              Requested:{" "}
                              {new Date(
                                consultation.createdAt,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {consultation.status === "in-consultation" && (
                            <button
                              onClick={() =>
                                handleStartChat(consultation.doctorId?._id)
                              }
                              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2.5 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition font-semibold shadow-md"
                            >
                              Start Chat
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Show Scheduled Appointments */}
                    {appointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg dark:hover:shadow-gray-900/30 transition bg-white dark:bg-gray-800"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                              style={{
                                backgroundColor:
                                  appointment.doctorId?.avatarColor ||
                                  "#14B8A6",
                              }}
                            >
                              {appointment.doctorId?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "D"}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                Dr. {appointment.doctorId?.name}
                              </h4>
                              <p className="text-teal-600 dark:text-teal-400 font-medium">
                                {appointment.doctorId?.specialty ||
                                  "General Physician"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleStartChat(appointment.doctorId?._id)
                              }
                              className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800/50 transition"
                              title="Chat with Doctor"
                            >
                              <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 gap-3">
                          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                            <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            <span className="font-medium">
                              {new Date(
                                appointment.scheduledAt,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleStartChat(appointment.doctorId?._id)
                            }
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2.5 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition font-semibold shadow-md"
                          >
                            Start Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Chat List */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400" />
                    Your Conversations
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                  {chats.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                      <p className="font-medium">No conversations yet</p>
                      <p className="text-sm mt-2">
                        Book a consultation to start chatting with a doctor
                      </p>
                      <button
                        onClick={() => setActiveTab("consult")}
                        className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm"
                      >
                        Book Consultation
                      </button>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <button
                        key={chat._id}
                        onClick={() => handleSelectChat(chat)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                          selectedChat?._id === chat._id
                            ? "bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold relative"
                            style={{
                              backgroundColor:
                                chat.participant?.avatarColor || "#3B82F6",
                            }}
                          >
                            {chat.participant?.name?.charAt(0).toUpperCase() ||
                              "D"}
                            {/* Online/Offline indicator */}
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                                chat.participant?.isOnline
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white truncate">
                                Dr. {chat.participant?.name}
                              </span>
                              {chat.unreadCount > 0 && (
                                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {chat.lastMessage?.text || "No messages yet"}
                            </p>
                            <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                              {chat.participant?.specialty ||
                                "General Physician"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div
                className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 flex flex-col"
                style={{ height: "600px" }}
              >
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundColor:
                              selectedChat.participant?.avatarColor ||
                              "#3B82F6",
                          }}
                        >
                          {selectedChat.participant?.name
                            ?.charAt(0)
                            .toUpperCase() || "D"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Dr. {selectedChat.participant?.name}
                          </h3>
                          <p className="text-sm text-teal-600 dark:text-teal-400">
                            {selectedChat.participant?.specialty ||
                              "General Physician"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`flex items-center text-xs ${
                            selectedChat.participant?.isOnline
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-1 ${
                              selectedChat.participant?.isOnline
                                ? "bg-green-500 animate-pulse"
                                : "bg-gray-400"
                            }`}
                          ></span>
                          {selectedChat.participant?.isOnline
                            ? "Online"
                            : "Offline"}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                      {chatLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : messages.length === 0 ? (
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
                                    msg._id,
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
                                  <p className="text-sm">{msg.text}</p>
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

                    {/* Message Input */}
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
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !messageInput.trim()}
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-3 rounded-xl hover:from-teal-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-sm">
                        Choose a doctor from the list to view messages
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Symptoms Tab */}
          {activeTab === "symptoms" && (
            <div
              ref={symptomsRef}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md dark:shadow-gray-900/30 scroll-mt-6"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Symptom Checker
                  </h2>
                  <span className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                    Powered by Google Gemini
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 ml-13">
                Describe your symptoms in detail and our AI will analyze them to
                provide health insights, urgency assessment, and
                recommendations.
              </p>

              <div className="space-y-4">
                <textarea
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  placeholder="Describe your symptoms in detail. Include:
• What symptoms you're experiencing (e.g., headache, fever, cough)
• How long you've had them
• Severity (mild, moderate, severe)
• Any other relevant information

Example: I've been experiencing severe headaches for the past 3 days, along with a mild fever around 100°F. The headache is worse in the morning and I also feel nauseous."
                  className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAnalyzeSymptoms}
                    disabled={analyzing || !symptomText.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5 mr-2" />
                        <span>Analyze Symptoms</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSymptomText("");
                      setSymptomAnalysis(null);
                    }}
                    className="sm:w-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold"
                  >
                    Clear
                  </button>
                </div>

                {symptomAnalysis && (
                  <div className="mt-6 space-y-4">
                    {/* Urgency Level Banner */}
                    <div
                      className={`p-4 rounded-xl border-2 ${
                        symptomAnalysis.urgencyLevel === "emergency"
                          ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                          : symptomAnalysis.urgencyLevel === "high"
                            ? "bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700"
                            : symptomAnalysis.urgencyLevel === "medium"
                              ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                              : "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            symptomAnalysis.urgencyLevel === "emergency"
                              ? "bg-red-500"
                              : symptomAnalysis.urgencyLevel === "high"
                                ? "bg-orange-500"
                                : symptomAnalysis.urgencyLevel === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                        >
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-bold text-lg ${
                              symptomAnalysis.urgencyLevel === "emergency"
                                ? "text-red-800 dark:text-red-200"
                                : symptomAnalysis.urgencyLevel === "high"
                                  ? "text-orange-800 dark:text-orange-200"
                                  : symptomAnalysis.urgencyLevel === "medium"
                                    ? "text-yellow-800 dark:text-yellow-200"
                                    : "text-green-800 dark:text-green-200"
                            }`}
                          >
                            {symptomAnalysis.urgencyLevel === "emergency"
                              ? "🚨 Emergency"
                              : symptomAnalysis.urgencyLevel === "high"
                                ? "🔴 High Urgency"
                                : symptomAnalysis.urgencyLevel === "medium"
                                  ? "🟠 Moderate Urgency"
                                  : "🟢 Low Urgency"}
                          </h4>
                          <p
                            className={`mt-1 text-sm ${
                              symptomAnalysis.urgencyLevel === "emergency"
                                ? "text-red-700 dark:text-red-300"
                                : symptomAnalysis.urgencyLevel === "high"
                                  ? "text-orange-700 dark:text-orange-300"
                                  : symptomAnalysis.urgencyLevel === "medium"
                                    ? "text-yellow-700 dark:text-yellow-300"
                                    : "text-green-700 dark:text-green-300"
                            }`}
                          >
                            {symptomAnalysis.urgencyMessage}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Results Card */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 space-y-5">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          AI Analysis Results
                        </h3>
                        <span className="text-xs bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-full">
                          Powered by Gemini AI
                        </span>
                      </div>

                      {/* Possible Conditions */}
                      {symptomAnalysis.possibleConditions?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Possible Conditions:
                          </p>
                          <div className="space-y-3">
                            {symptomAnalysis.possibleConditions.map(
                              (condition, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {condition.name}
                                    </span>
                                    <span
                                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                        condition.probability >= 70
                                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                          : condition.probability >= 50
                                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {condition.probability}% match
                                    </span>
                                  </div>
                                  {condition.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {condition.description}
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {symptomAnalysis.recommendations?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Recommendations:
                          </p>
                          <ul className="space-y-2">
                            {symptomAnalysis.recommendations.map((rec, idx) => (
                              <li
                                key={idx}
                                className="flex items-start text-sm text-gray-600 dark:text-gray-400"
                              >
                                <Check className="w-4 h-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Doctor Consultation Card */}
                    {symptomAnalysis.shouldConsultDoctor && (
                      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-xl p-5 border border-teal-200 dark:border-teal-700">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-teal-800 dark:text-teal-200 mb-1">
                              Consult a Doctor
                            </h4>
                            <p className="text-sm text-teal-700 dark:text-teal-300 mb-4">
                              {symptomAnalysis.consultationMessage ||
                                "Based on your symptoms, we recommend consulting with a healthcare professional for proper diagnosis and personalized treatment."}
                            </p>
                            <button
                              onClick={() => handleTabClick("consult")}
                              className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-md"
                            >
                              <Calendar className="w-4 h-4" />
                              <span>Book Consultation Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    {symptomAnalysis.disclaimer && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                        {symptomAnalysis.disclaimer}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">
                      This is not medical advice
                    </p>
                    <p>
                      Symptom analysis is AI-powered and should not replace
                      professional medical consultation. For emergencies, call
                      911.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>{" "}
        {/* End of content container */}
      </div>
    </div>
  );
};

export default PatientDashboard;
