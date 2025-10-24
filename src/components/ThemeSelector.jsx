import React, { useState } from "react";
import { FaPalette, FaChevronDown, FaCheck } from "react-icons/fa";
import { themes } from "../utils/themes";

const ThemeSelector = ({ currentTheme, onThemeChange, theme: colorMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeSelect = (themeKey) => {
    onThemeChange(themeKey);
    setIsOpen(false);
  };

  const currentThemeData = themes[currentTheme];

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="absolute top-5 left-5 bg-white bg-opacity-20 hover:bg-opacity-30 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-white text-lg transition-all duration-300 z-10"
        title="Choose Theme"
      >
        <FaPalette />
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Choose Theme
            </h3>
            <div className="space-y-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => handleThemeSelect(key)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    currentTheme === key
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.gradients.header}`}
                    ></div>
                    <div className="text-left">
                      <div className={`text-sm font-medium ${
                        currentTheme === key 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {theme.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {theme.description}
                      </div>
                    </div>
                  </div>
                  {currentTheme === key && (
                    <FaCheck className="text-blue-600 dark:text-blue-400 text-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSelector; 