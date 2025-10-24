import React from "react";
import { FaTimes } from "react-icons/fa";
import { getThemeColors } from "../utils/themes";

const Languages = ({ displayData, isEditing, editData, handleArrayChange, addArrayItem, removeArrayItem, currentTheme, theme: colorMode }) => {
  if (!displayData.languages || displayData.languages.length === 0) {
    return null;
  }

  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;
  const languagesGradient = themeColors.gradients.languages;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        Languages
      </h2>
      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3">
            {editData.languages?.map((lang, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={typeof lang === 'string' ? lang : lang.name || ''}
                  onChange={(e) => {
                    const newValue = typeof lang === 'string' 
                      ? e.target.value 
                      : {...lang, name: e.target.value};
                    handleArrayChange('languages', index, newValue);
                  }}
                  className={`flex-1 px-4 py-2 ${themeColors.cardHover[colorMode]} border ${themeColors.input[colorMode]} rounded-full text-sm font-medium focus:outline-none focus:border-${accentColor}`}
                  placeholder="Language"
                />
                {typeof lang === 'object' && (
                  <input
                    type="text"
                    value={lang.proficiency || ''}
                    onChange={(e) => handleArrayChange('languages', index, {...lang, proficiency: e.target.value})}
                    className={`w-32 px-3 py-2 ${themeColors.cardHover[colorMode]} border ${themeColors.input[colorMode]} rounded-full text-sm focus:outline-none focus:border-${accentColor}`}
                    placeholder="Level"
                  />
                )}
                <button
                  onClick={() => removeArrayItem('languages', index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('languages')}
              className={`text-${accentColor} hover:text-${accentColor}/80 text-sm font-medium`}
            >
              + Add Language
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {displayData.languages.map((lang, index) => (
              <span
                key={index}
                className={`bg-gradient-to-r ${languagesGradient} text-white px-4 py-2 rounded-full text-sm font-medium inline-block transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                {typeof lang === 'string' ? lang : `${lang.name} (${lang.proficiency})`}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Languages; 