import React from "react";
import { FaTimes } from "react-icons/fa";
import { getThemeColors } from "../utils/themes";

const SkillsSection = ({ 
  title, 
  field, 
  displayData, 
  isEditing, 
  editData, 
  handleArrayChange, 
  addArrayItem, 
  removeArrayItem,
  currentTheme,
  theme: colorMode
}) => {
  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;
  const gradientClass = field === 'languages' ? themeColors.gradients.languages : themeColors.gradients.skills;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        {title}
      </h2>
      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3">
            {editData[field]?.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayChange(field, index, e.target.value)}
                  className={`flex-1 px-4 py-2 ${themeColors.cardHover[colorMode]} border ${themeColors.input[colorMode]} rounded-full text-sm font-medium focus:outline-none focus:border-${accentColor}`}
                  placeholder={field === 'expertise' ? 'Expertise area' : 'Skill or technology'}
                />
                <button
                  onClick={() => removeArrayItem(field, index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(field)}
              className={`text-${accentColor} hover:text-${accentColor}/80 text-sm font-medium`}
            >
              + Add {field === 'expertise' ? 'Expertise' : 'Skill'}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {displayData[field]?.map((skill, index) => (
              <span
                key={index}
                className={`bg-gradient-to-r ${gradientClass} text-white px-4 py-2 rounded-full text-sm font-medium inline-block transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillsSection; 