import React from "react";
import { getThemeColors } from "../utils/themes";

const Certifications = ({ displayData, isEditing, editData, handleArrayChange, currentTheme, theme: colorMode }) => {
  if (!displayData.certifications || displayData.certifications.length === 0) {
    return null;
  }

  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        Certifications
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayData.certifications.map((cert, index) => (
          <div key={index} className={`${themeColors.cardHover[colorMode]} p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={cert.name || ''}
                  onChange={(e) => handleArrayChange('certifications', index, {...cert, name: e.target.value})}
                  className={`w-full text-base font-semibold ${themeColors.text.primary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Certification Name"
                />
                <input
                  type="text"
                  value={cert.issuer || ''}
                  onChange={(e) => handleArrayChange('certifications', index, {...cert, issuer: e.target.value})}
                  className={`w-full text-sm text-${accentColor} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Issuing Organization"
                />
                <input
                  type="text"
                  value={cert.date || ''}
                  onChange={(e) => handleArrayChange('certifications', index, {...cert, date: e.target.value})}
                  className={`w-full text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                  placeholder="Date Obtained"
                />
              </div>
            ) : (
              <>
                <h3 className={`text-base font-semibold mb-1 ${themeColors.text.primary[colorMode]}`}>
                  {cert.name}
                </h3>
                <p className={`text-sm text-${accentColor} mb-1`}>
                  {cert.issuer}
                </p>
                <p className={`text-xs ${themeColors.text.secondary[colorMode]}`}>
                  {cert.date}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certifications; 