import React from "react";
import { getThemeColors } from "../utils/themes";

const CareerObjective = ({ displayData, isEditing, editData, handleInputChange, currentTheme, theme: colorMode }) => {
  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        Career Objective
      </h2>
      {isEditing ? (
        <textarea
          value={editData.summary || ''}
          onChange={(e) => handleInputChange('summary', e.target.value)}
          className={`w-full text-base leading-relaxed ${themeColors.text.secondary[colorMode]} ${themeColors.cardHover[colorMode]} border ${themeColors.input[colorMode]} rounded-lg p-4 focus:outline-none focus:border-${accentColor} resize-none`}
          placeholder="Career objective or professional summary"
          rows="4"
        />
      ) : (
        <p className={`text-base leading-relaxed ${themeColors.text.secondary[colorMode]} mb-4`}>
          {displayData.summary}
        </p>
      )}
    </section>
  );
};

export default CareerObjective; 