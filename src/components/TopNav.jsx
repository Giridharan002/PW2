import React from "react";
import { FaPalette, FaLayerGroup } from "react-icons/fa";
import { themes } from "../utils/themes";

const TopNav = ({ currentTheme, onThemeChange, theme: colorMode, selectedTemplate, onTemplateChange }) => {
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = React.useState(false);

  const toggleThemeDropdown = () => {
    setIsThemeOpen(!isThemeOpen);
    setIsTemplateOpen(false);
  };

  const toggleTemplateDropdown = () => {
    setIsTemplateOpen(!isTemplateOpen);
    setIsThemeOpen(false);
  };

  const handleThemeSelect = (themeKey) => {
    onThemeChange(themeKey);
    setIsThemeOpen(false);
  };

  const handleTemplateSelect = (templateKey) => {
    onTemplateChange(templateKey);
    setIsTemplateOpen(false);
  };

  const currentThemeData = themes[currentTheme];

  const templates = {
    default: { name: "Default Layout", description: "Original component-based layout" },
    classic: { name: "Classic Template", description: "Traditional, formal design" },
    modern: { name: "Modern Template", description: "Card-based, dynamic layout" },
    elegant: { name: "Elegant Template", description: "Sophisticated, premium design" }
  };

  const currentTemplateData = templates[selectedTemplate];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Portfolio Builder
          </h1>
        </div>

        {/* Right side - Theme and Template Selectors */}
        <div className="flex items-center space-x-2">
          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={toggleTemplateDropdown}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Choose Template"
            >
              <FaLayerGroup className="text-lg" />
              <span className="hidden sm:inline">{currentTemplateData.name}</span>
            </button>

            {isTemplateOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Choose Template
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(templates).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => handleTemplateSelect(key)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          selectedTemplate === key
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-600 dark:bg-gray-300 rounded"></div>
                          </div>
                          <div className="text-left">
                            <div className={`text-sm font-medium ${
                              selectedTemplate === key 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {template.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {template.description}
                            </div>
                          </div>
                        </div>
                        {selectedTemplate === key && (
                          <div className="text-blue-600 dark:text-blue-400 text-sm">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={toggleThemeDropdown}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Choose Theme"
            >
              <FaPalette className="text-lg" />
              <span className="hidden sm:inline">{currentThemeData.name}</span>
            </button>

            {isThemeOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
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
                          <div className="text-blue-600 dark:text-blue-400 text-sm">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Backdrop to close dropdowns when clicking outside */}
          {(isThemeOpen || isTemplateOpen) && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => {
                setIsThemeOpen(false);
                setIsTemplateOpen(false);
              }}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav; 