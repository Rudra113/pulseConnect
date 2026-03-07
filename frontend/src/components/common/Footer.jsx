/**
 * Footer Component
 * Accessible footer with modern design
 */

import React from "react";
import { Activity, Heart, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">
                PulseConnect
              </span>
            </div>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
              Making healthcare accessible, simple, and personal for everyone.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-400">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 flex-shrink-0" />
                <span className="text-sm sm:text-lg">1-800-PULSE-CONNECT</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-400">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 flex-shrink-0" />
                <span className="text-sm sm:text-lg break-all">
                  support@pulseconnect.health
                </span>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-5">
              Product
            </h3>
            <ul className="space-y-2 sm:space-y-4">
              <li>
                <a
                  href="#features"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  For Doctors
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="hidden sm:block">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-5">
              Company
            </h3>
            <ul className="space-y-2 sm:space-y-4">
              <li>
                <a
                  href="#about"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="hidden sm:block">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-5">Legal</h3>
            <ul className="space-y-2 sm:space-y-4">
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  HIPAA Compliance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-base sm:text-lg text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Accessibility
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-gray-400 text-sm sm:text-lg text-center sm:text-left">
              © {new Date().getFullYear()} PulseConnect. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs sm:text-base">
              Made with{" "}
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 inline mx-1" />{" "}
              for better healthcare
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
