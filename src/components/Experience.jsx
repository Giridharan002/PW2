import React from "react";
import { getThemeColors } from "../utils/themes";

const Experience = ({ displayData, isEditing, editData, handleArrayChange, currentTheme, theme: colorMode }) => {
  if (!displayData.experience || displayData.experience.length === 0) {
    return null;
  }

  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        Experience
      </h2>
      <div className="space-y-4">
        {displayData.experience.map((exp, index) => (
          <div key={index} className={`${themeColors.cardHover[colorMode]} p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={exp.title || ''}
                  onChange={(e) => handleArrayChange('experience', index, {...exp, title: e.target.value})}
                  className={`w-full text-lg font-semibold ${themeColors.text.primary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Job Title"
                />
                <input
                  type="text"
                  value={exp.company || ''}
                  onChange={(e) => handleArrayChange('experience', index, {...exp, company: e.target.value})}
                  className={`w-full text-base font-medium text-${accentColor} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Company Name"
                />
                <input
                  type="text"
                  value={exp.duration || ''}
                  onChange={(e) => handleArrayChange('experience', index, {...exp, duration: e.target.value})}
                  className={`w-full text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Duration"
                />
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => handleArrayChange('experience', index, {...exp, description: e.target.value})}
                  className={`w-full text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border ${themeColors.input[colorMode]} rounded p-2 focus:outline-none focus:border-${accentColor} resize-none`}
                  placeholder="Job Description"
                  rows="3"
                />
              </div>
            ) : (
              <>
                <h3 className={`text-lg font-semibold mb-2 ${themeColors.text.primary[colorMode]}`}>
                  {exp.title}
                </h3>
                <h4 className={`text-base font-medium text-${accentColor} mb-2`}>
                  {exp.company}
                </h4>
                <p className={`text-sm ${themeColors.text.secondary[colorMode]} mb-2`}>
                  {exp.duration}
                </p>
                {exp.description && (
                  <p className={`text-sm ${themeColors.text.secondary[colorMode]}`}>
                    {exp.description}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience; 