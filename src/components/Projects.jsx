import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { getThemeColors } from "../utils/themes";

const Projects = ({ displayData, isEditing, editData, handleArrayChange, currentTheme, theme: colorMode }) => {
  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayData.projects?.map((project, index) => (
          <div key={index} className={`${themeColors.cardHover[colorMode]} rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full flex flex-col`}>
            <div className="p-6 flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={project.title || ''}
                    onChange={(e) => handleArrayChange('projects', index, {...project, title: e.target.value})}
                    className={`w-full text-lg font-semibold ${themeColors.text.primary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                    placeholder="Project Title"
                  />
                  <textarea
                    value={project.description || ''}
                    onChange={(e) => handleArrayChange('projects', index, {...project, description: e.target.value})}
                    className={`w-full text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border ${themeColors.input[colorMode]} rounded p-2 focus:outline-none focus:border-${accentColor} resize-none`}
                    placeholder="Project Description"
                    rows="3"
                  />
                  <input
                    type="url"
                    value={project.link || ''}
                    onChange={(e) => handleArrayChange('projects', index, {...project, link: e.target.value})}
                    className={`w-full text-sm text-${accentColor} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor}`}
                    placeholder="Project URL"
                  />
                </div>
              ) : (
                <>
                  <h3 className={`text-lg font-semibold mb-2 ${themeColors.text.primary[colorMode]}`}>
                    {project.title}
                  </h3>
                  <p className={`text-sm ${themeColors.text.secondary[colorMode]} mb-4`}>
                    {project.description}
                  </p>
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`inline-flex items-center text-${accentColor} hover:underline text-sm font-medium`}
                    >
                      View Project <FaExternalLinkAlt className="ml-1 text-xs" />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects; 