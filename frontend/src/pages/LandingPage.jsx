/**
 * Landing Page Component
 * Modern, accessible landing page optimized for all ages
 */

import React, { useState } from "react";
import {
  User,
  MessageSquare,
  Pill,
  Calendar,
  ArrowRight,
  Activity,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Star,
  CheckCircle,
  Phone,
  Mail,
  AlertCircle,
  Stethoscope,
  Check,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { symptomsAPI } from "../services/api";

const LandingPage = ({ onLoginClick }) => {
  // Symptom checker state
  const [symptomText, setSymptomText] = useState("");
  const [symptomAnalysis, setSymptomAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Analyze symptoms using public API
  const handleAnalyzeSymptoms = async () => {
    if (!symptomText.trim()) return;

    try {
      setAnalyzing(true);
      const response = await symptomsAPI.analyzePublic(symptomText);
      if (response.success) {
        setSymptomAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      alert("Failed to analyze symptoms. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle book consultation - redirect to login
  const handleBookConsultation = () => {
    onLoginClick();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar onLoginClick={onLoginClick} />

      {/* Hero Section - Elder-friendly with large text */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Decorative elements - hidden on mobile for cleaner look */}
        <div className="hidden sm:block absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-teal-100 dark:bg-teal-900/30 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2"></div>
        <div className="hidden sm:block absolute bottom-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-full text-base font-medium mb-6">
                <Activity className="w-5 h-5" />
                <span>Trusted by 50,000+ patients</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                Your Health,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  {" "}
                  Simplified
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Connect with certified doctors instantly, track your medications
                easily, and manage your health — all from the comfort of your
                home.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button
                  onClick={onLoginClick}
                  className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300 text-lg sm:text-xl font-semibold flex items-center justify-center shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 hover:-translate-y-1"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 sm:border-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl hover:border-teal-600 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-300 text-lg sm:text-xl font-semibold">
                  Watch Demo
                </button>
              </div>
              {/* Trust indicators */}
              <div className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  <span className="text-base sm:text-lg">Free to Start</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  <span className="text-base sm:text-lg">HIPAA Secure</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />
                  <span className="text-base sm:text-lg">24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Hero Card */}
            <div className="relative mx-auto lg:mx-0 max-w-sm sm:max-w-md w-full mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl sm:rounded-3xl transform rotate-3 scale-105 opacity-20"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
                    Upcoming Appointment
                  </span>
                  <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    Today
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                      Dr. Sarah Williams
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                      Cardiologist
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <span className="text-base sm:text-lg font-medium">
                        Today, 2:00 PM
                      </span>
                    </div>
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition-all flex items-center justify-center space-x-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Chat with our Doctor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Enhanced for clarity */}
      <section
        id="how-it-works"
        className="py-12 sm:py-20 md:py-28 bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-base sm:text-lg font-medium mb-3 sm:mb-4">
              Simple Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Getting Started is Easy
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Quality healthcare in three simple steps — no complicated setup
              required
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-12">
            {[
              {
                icon: User,
                title: "Create Your Account",
                description:
                  "Sign up in under 2 minutes. Just your name, email, and you're ready to go.",
                color: "from-teal-500 to-teal-600",
              },
              {
                icon: MessageSquare,
                title: "Connect with Doctors",
                description:
                  "Choose from 500+ verified healthcare professionals. Chat with doctors instantly.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Pill,
                title: "Manage Your Health",
                description:
                  "Track medications with reminders, check symptoms, and receive personalized care.",
                color: "from-purple-500 to-purple-600",
              },
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                  {/* Step number */}
                  <div
                    className={`absolute -top-4 sm:-top-5 left-6 sm:left-8 bg-gradient-to-r ${step.color} text-white w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg`}
                  >
                    {idx + 1}
                  </div>
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${step.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mt-3 sm:mt-4`}
                  >
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                    {step.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Larger and clearer */}
      <section
        id="features"
        className="py-12 sm:py-20 md:py-28 bg-white dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-base sm:text-lg font-medium mb-3 sm:mb-4">
              Powerful Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Everything You Need for Better Health
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Comprehensive healthcare tools designed to make managing your
              health simple and stress-free
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Live Chat with Doctors",
                description:
                  "Connect with your doctor instantly from anywhere. Real-time messaging that works on any device.",
                color: "bg-blue-500",
                lightColor: "bg-blue-100",
              },
              {
                icon: Pill,
                title: "Medication Reminders",
                description:
                  "Never miss a dose again. Get friendly reminders and track your medication schedule easily.",
                color: "bg-teal-500",
                lightColor: "bg-teal-100",
              },
              {
                icon: Activity,
                title: "Symptom Checker",
                description:
                  "Describe how you feel and get guidance. Our AI helps you understand your symptoms.",
                color: "bg-rose-500",
                lightColor: "bg-rose-100",
              },
              {
                icon: FileText,
                title: "Digital Prescriptions",
                description:
                  "Receive prescriptions directly in the app. Send to any pharmacy with one tap.",
                color: "bg-purple-500",
                lightColor: "bg-purple-100",
              },
              {
                icon: Shield,
                title: "100% Private & Secure",
                description:
                  "Your health data is encrypted and protected. HIPAA compliant for your peace of mind.",
                color: "bg-green-500",
                lightColor: "bg-green-100",
              },
              {
                icon: TrendingUp,
                title: "Health Tracking",
                description:
                  "Monitor your progress over time. Easy-to-read charts show how your health is improving.",
                color: "bg-orange-500",
                lightColor: "bg-orange-100",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-700 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.lightColor} dark:opacity-80 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color.replace("bg-", "text-")}`}
                  />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Comprehensive and presentable */}
      <section
        id="about"
        className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-base sm:text-lg font-medium mb-3 sm:mb-4">
              About PulseConnect
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Healthcare Made Human
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We believe everyone deserves easy access to quality healthcare,
              regardless of age or technical ability
            </p>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Our Mission
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                To make healthcare accessible, affordable, and easy to
                understand for everyone. We're committed to breaking down
                barriers that prevent people from getting the care they need,
                when they need it.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Our Vision
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                A world where quality healthcare is just a tap away. We envision
                a future where managing your health is as simple as checking
                your email — intuitive, reliable, and always there when you need
                it.
              </p>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 mb-10 sm:mb-16">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
              Our Core Values
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[
                {
                  title: "Patient First",
                  desc: "Your health and comfort are our top priority",
                },
                {
                  title: "Accessibility",
                  desc: "Designed for everyone, including seniors",
                },
                {
                  title: "Trust & Privacy",
                  desc: "Your data is always safe and secure",
                },
                {
                  title: "Excellence",
                  desc: "Only verified, qualified healthcare professionals",
                },
              ].map((value, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                    <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h4 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">
                    {value.title}
                  </h4>
                  <p className="text-teal-100 text-sm sm:text-lg">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Families Trust PulseConnect
              </h3>
              <div className="space-y-6">
                {[
                  {
                    title: "Easy for All Ages",
                    desc: "Large text, clear buttons, and simple navigation designed with seniors in mind",
                  },
                  {
                    title: "Verified Doctors Only",
                    desc: "Every healthcare provider is thoroughly vetted and licensed",
                  },
                  {
                    title: "24/7 Human Support",
                    desc: "Real people ready to help you anytime — not just chatbots",
                  },
                  {
                    title: "No Hidden Costs",
                    desc: "Transparent pricing with no surprises on your bill",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Get in Touch
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Have questions? We're here to help. Reach out anytime and our
                friendly team will assist you.
              </p>
              <div className="space-y-5">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500 text-base">
                      Call Us
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      1-800-PULSE-AI
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500 text-base">
                      Email Us
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      support@pulseconnect.health
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500 text-base">
                      Hours
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      24/7 Available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Symptom Checker Section */}
      <section
        id="symptom-checker"
        className="py-12 sm:py-20 md:py-28 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-base sm:text-lg font-medium mb-3 sm:mb-4">
              🩺 Try This Feature
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              AI Symptom Checker
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Experience our AI-powered symptom analysis. Describe how you feel
              and get instant health insights — no account needed!
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-start sm:items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Describe Your Symptoms
                </h3>
                <span className="text-xs sm:text-sm bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                  Powered by Google Gemini AI
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder="Example: I've been experiencing severe headaches for the past 3 days, along with a mild fever around 100°F. The headache is worse in the morning and I also feel nauseous."
                className="w-full h-32 sm:h-40 px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base sm:text-lg"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAnalyzeSymptoms}
                  disabled={analyzing || !symptomText.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base sm:text-lg"
                >
                  {analyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Analyzing...</span>
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
                  className="sm:w-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold text-lg"
                >
                  Clear
                </button>
              </div>

              {/* Analysis Results */}
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
                          className={`mt-1 text-base ${
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

                  {/* Analysis Details Card */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 space-y-5">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        AI Analysis Results
                      </h3>
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
                              className="flex items-start text-base text-gray-600 dark:text-gray-400"
                            >
                              <Check className="w-4 h-4 text-teal-500 mr-2 mt-1 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Book Consultation CTA */}
                  {symptomAnalysis.shouldConsultDoctor && (
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-xl p-6 border border-teal-200 dark:border-teal-700">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-teal-800 dark:text-teal-200 text-lg mb-1">
                              Ready to Consult a Doctor?
                            </h4>
                            <p className="text-base text-teal-700 dark:text-teal-300">
                              Sign up or login to book a consultation with our
                              certified healthcare professionals.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleBookConsultation}
                          className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center justify-center space-x-2 text-lg"
                        >
                          <Calendar className="w-5 h-5" />
                          <span>Login to Book</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {symptomAnalysis.disclaimer && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center">
                      {symptomAnalysis.disclaimer}
                    </p>
                  )}
                </div>
              )}

              {/* Always visible disclaimer */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-base text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">This is not medical advice</p>
                  <p>
                    AI symptom analysis should not replace professional medical
                    consultation. For emergencies, call 911.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gradient-to-r from-teal-600 via-teal-700 to-blue-700 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: "50,000+", label: "Active Patients", icon: Users },
              { value: "500+", label: "Certified Doctors", icon: User },
              { value: "4.9/5", label: "Patient Rating", icon: Star },
              { value: "24/7", label: "Available Support", icon: Clock },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg md:text-xl text-teal-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-teal-600 via-teal-700 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl sm:text-2xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Join thousands of patients who've made healthcare simple. Start your
            free account today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onLoginClick}
              className="group bg-white text-teal-700 px-10 py-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center"
            >
              Create Free Account
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-3 border-white/50 text-white px-10 py-5 rounded-2xl hover:bg-white/10 transition-all duration-300 text-xl font-semibold">
              Talk to Support
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
