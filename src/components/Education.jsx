import React from "react";
import { getThemeColors } from "../utils/themes";

const Education = ({ displayData, isEditing, editData, handleArrayChange, currentTheme, theme: colorMode }) => {
  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        Education
      </h2>
      <div className="space-y-4">
        {displayData.education?.map((edu, index) => (
          <div key={index} className={`${themeColors.cardHover[colorMode]} p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={edu.degree || ''}
                  onChange={(e) => handleArrayChange('education', index, {...edu, degree: e.target.value})}
                  className={`w-full text-lg font-semibold ${themeColors.text.primary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Degree/Qualification"
                />
                <input
                  type="text"
                  value={edu.institution || ''}
                  onChange={(e) => handleArrayChange('education', index, {...edu, institution: e.target.value})}
                  className={`w-full text-base font-medium text-${accentColor} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Institution"
                />
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={edu.duration || ''}
                    onChange={(e) => handleArrayChange('education', index, {...edu, duration: e.target.value})}
                    className={`flex-1 text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                    placeholder="Duration"
                  />
                  <input
                    type="text"
                    value={edu.grade || ''}
                    onChange={(e) => handleArrayChange('education', index, {...edu, grade: e.target.value})}
                    className={`flex-1 text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                    placeholder="Grade/Score"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className={`text-lg font-semibold mb-2 ${themeColors.text.primary[colorMode]}`}>
                  {edu.degree}
                </h3>
                {edu.institution && (
                  <h4 className={`text-base font-medium text-${accentColor} mb-2`}>
                    {edu.institution}
                  </h4>
                )}
                <p className={`text-sm ${themeColors.text.secondary[colorMode]}`}>
                  {edu.duration && edu.grade ? `${edu.duration} | ${edu.grade}` : edu.duration || edu.grade}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Education; 