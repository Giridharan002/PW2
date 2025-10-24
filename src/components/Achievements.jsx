import React from "react";
import { FaTimes } from "react-icons/fa";
import { getThemeColors } from "../utils/themes";

const Achievements = ({ displayData, isEditing, editData, handleArrayChange, addArrayItem, removeArrayItem, currentTheme, theme: colorMode }) => {
  if (!displayData.achievements || displayData.achievements.length === 0) {
    return null;
  }

  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        Achievements
      </h2>
      <div className="space-y-3">
        {displayData.achievements.map((achievement, index) => (
          <div key={index} className={`${themeColors.cardHover[colorMode]} p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => handleArrayChange('achievements', index, e.target.value)}
                  className={`flex-1 text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Achievement"
                />
                <button
                  onClick={() => removeArrayItem('achievements', index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <p className={`text-sm ${themeColors.text.secondary[colorMode]} flex items-start`}>
                <span className={`text-${accentColor} mr-2 mt-1`}>•</span>
                {achievement}
              </p>
            )}
          </div>
        ))}
        {isEditing && (
          <button
            onClick={() => addArrayItem('achievements')}
            className={`text-${accentColor} hover:text-${accentColor}/80 text-sm font-medium`}
          >
            + Add Achievement
          </button>
        )}
      </div>
    </section>
  );
};

export default Achievements; 