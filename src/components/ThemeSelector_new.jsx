import React, { useState } from "react";
import { FaPalette, FaChevronDown, FaCheck, FaMoon, FaSun } from "react-icons/fa";
import { themes } from "../utils/themes";

const ThemeSelector = ({ currentTheme, onThemeChange, theme: colorMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeSelect = (themeKey) => {
    onThemeChange(themeKey);
    setIsOpen(false);
  };

  const handleModeToggle = () => {
    onModeChange(colorMode === 'light' ? 'dark' : 'light');
  };

  const currentThemeData = themes[currentTheme];

  return (
    <div className="flex items-center space-x-3">
      {/* Theme Selector */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <FaPalette className="text-sm" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentThemeData?.name || 'Modern'}
          </span>
          <FaChevronDown className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="absolute top-12 left-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
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
            
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </div>

      {/* Light/Dark Mode Toggle */}
      <button
        onClick={handleModeToggle}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        title={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      >
        {colorMode === 'light' ? (
          <FaMoon className="text-sm text-gray-700 dark:text-gray-300" />
        ) : (
          <FaSun className="text-sm text-yellow-500" />
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
          {colorMode}
        </span>
      </button>
    </div>
  );
};

export default ThemeSelector;
