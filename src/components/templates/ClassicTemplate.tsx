import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";
import { getThemeColors } from "../../utils/themes";

interface ClassicTemplateProps {
  displayData: any;
  isEditing: boolean;
  editData: any;
  handleInputChange: (field: string, value: string) => void;
  handleArrayChange: (field: string, index: number, value: any) => void;
  addArrayItem: (field: string) => void;
  removeArrayItem: (field: string, index: number) => void;
  currentTheme: string;
  theme: string;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({
  displayData,
  isEditing,
  editData,
  handleInputChange,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  currentTheme,
  theme: colorMode
}) => {
  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;

  return (
    <div className="classic-template">
      {/* Contact Information - Horizontal Layout */}
      <section className="mb-8 border-b border-gray-300 dark:border-gray-600 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <FaPhone className={`text-${accentColor} mr-2`} />
            {isEditing ? (
              <input
                type="text"
                value={editData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Phone"
              />
            ) : (
              <span className={themeColors.text.primary[colorMode]}>{displayData.phone}</span>
            )}
          </div>
          
          <div className="flex items-center">
            <FaEnvelope className={`text-${accentColor} mr-2`} />
            {isEditing ? (
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Email"
              />
            ) : (
              <a href={`mailto:${displayData.email}`} className={`text-${accentColor} hover:underline`}>
                {displayData.email}
              </a>
            )}
          </div>
          
          <div className="flex items-center">
            <FaMapMarkerAlt className={`text-${accentColor} mr-2`} />
            {isEditing ? (
              <input
                type="text"
                value={editData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Address"
              />
            ) : (
              <span className={themeColors.text.primary[colorMode]}>{displayData.address}</span>
            )}
          </div>
        </div>
      </section>

      {/* Career Objective */}
      <section className="mb-8">
        <h2 className={`text-xl font-bold text-${accentColor} mb-4 border-b-2 border-${accentColor} pb-2`}>
          CAREER OBJECTIVE
        </h2>
        {isEditing ? (
          <textarea
            value={editData.summary || ''}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:border-${accentColor}`}
            placeholder="Career objective"
            rows="3"
          />
        ) : (
          <p className={`${themeColors.text.primary[colorMode]} leading-relaxed`}>
            {displayData.summary}
          </p>
        )}
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className={`text-xl font-bold text-${accentColor} mb-4 border-b-2 border-${accentColor} pb-2`}>
          EDUCATION
        </h2>
        <div className="space-y-4">
          {displayData.education?.map((edu: any, index: number) => (
            <div key={index} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleArrayChange('education', index, {...edu, degree: e.target.value})}
                    className={`w-full font-bold ${themeColors.text.primary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => handleArrayChange('education', index, {...edu, institution: e.target.value})}
                    className={`w-full ${themeColors.text.primary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                    placeholder="Institution"
                  />
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={edu.duration || ''}
                      onChange={(e) => handleArrayChange('education', index, {...edu, duration: e.target.value})}
                      className={`flex-1 text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Duration"
                    />
                    <input
                      type="text"
                      value={edu.grade || ''}
                      onChange={(e) => handleArrayChange('education', index, {...edu, grade: e.target.value})}
                      className={`flex-1 text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Grade"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-lg">{edu.degree}</h3>
                  <p className="font-medium">{edu.institution}</p>
                  <p className={`text-sm ${themeColors.text.secondary[colorMode]}`}>
                    {edu.duration} | {edu.grade}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      {displayData.experience && displayData.experience.length > 0 && (
        <section className="mb-8">
          <h2 className={`text-xl font-bold text-${accentColor} mb-4 border-b-2 border-${accentColor} pb-2`}>
            EXPERIENCE
          </h2>
          <div className="space-y-4">
            {displayData.experience.map((exp: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={exp.title || ''}
                      onChange={(e) => handleArrayChange('experience', index, {...exp, title: e.target.value})}
                      className={`w-full font-bold ${themeColors.text.primary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Job Title"
                    />
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => handleArrayChange('experience', index, {...exp, company: e.target.value})}
                      className={`w-full ${themeColors.text.primary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={exp.duration || ''}
                      onChange={(e) => handleArrayChange('experience', index, {...exp, duration: e.target.value})}
                      className={`w-full text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Duration"
                    />
                    <textarea
                      value={exp.description || ''}
                      onChange={(e) => handleArrayChange('experience', index, {...exp, description: e.target.value})}
                      className={`w-full text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border border-gray-300 dark:border-gray-600 rounded p-2 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Description"
                      rows="2"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-lg">{exp.title}</h3>
                    <p className="font-medium">{exp.company}</p>
                    <p className={`text-sm ${themeColors.text.secondary[colorMode]} mb-2`}>{exp.duration}</p>
                    {exp.description && (
                      <p className={`text-sm ${themeColors.text.secondary[colorMode]}`}>{exp.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      <section className="mb-8">
        <h2 className={`text-xl font-bold text-${accentColor} mb-4 border-b-2 border-${accentColor} pb-2`}>
          SKILLS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Technical Skills</h3>
            {isEditing ? (
              <div className="space-y-2">
                {editData.skills?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                      className={`flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:border-${accentColor}`}
                      placeholder="Skill"
                    />
                    <button
                      onClick={() => removeArrayItem('skills', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('skills')}
                  className={`text-${accentColor} text-sm`}
                >
                  + Add Skill
                </button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {displayData.skills?.map((skill: string, index: number) => (
                  <li key={index} className={themeColors.text.primary[colorMode]}>{skill}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Areas of Expertise</h3>
            {isEditing ? (
              <div className="space-y-2">
                {editData.expertise?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                      className={`flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:border-${accentColor}`}
                      placeholder="Expertise"
                    />
                    <button
                      onClick={() => removeArrayItem('expertise', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('expertise')}
                  className={`text-${accentColor} text-sm`}
                >
                  + Add Expertise
                </button>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {displayData.expertise?.map((skill: string, index: number) => (
                  <li key={index} className={themeColors.text.primary[colorMode]}>{skill}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="mb-8">
        <h2 className={`text-xl font-bold text-${accentColor} mb-4 border-b-2 border-${accentColor} pb-2`}>
          PROJECTS
        </h2>
        <div className="space-y-4">
          {displayData.projects?.map((project: any, index: number) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={project.title || ''}
                    onChange={(e) => handleArrayChange('projects', index, {...project, title: e.target.value})}
                    className={`w-full font-bold ${themeColors.text.primary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                    placeholder="Project Title"
                  />
                  <textarea
                    value={project.description || ''}
                    onChange={(e) => handleArrayChange('projects', index, {...project, description: e.target.value})}
                    className={`w-full ${themeColors.text.secondary[colorMode]} bg-transparent border border-gray-300 dark:border-gray-600 rounded p-2 focus:outline-none focus:border-${accentColor}`}
                    placeholder="Description"
                    rows="2"
                  />
                  <input
                    type="url"
                    value={project.link || ''}
                    onChange={(e) => handleArrayChange('projects', index, {...project, link: e.target.value})}
                    className={`w-full text-sm text-${accentColor} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                    placeholder="Project URL"
                  />
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                  <p className={`${themeColors.text.secondary[colorMode]} mb-3`}>{project.description}</p>
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`inline-flex items-center text-${accentColor} hover:underline text-sm`}
                    >
                      View Project <FaExternalLinkAlt className="ml-1" />
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClassicTemplate; 