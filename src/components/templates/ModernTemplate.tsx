import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaExternalLinkAlt, FaStar } from "react-icons/fa";
import { getThemeColors } from "../../utils/themes";

interface ModernTemplateProps {
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

const ModernTemplate: React.FC<ModernTemplateProps> = ({
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
  
  // Get color classes based on theme
  const getAccentClasses = () => {
    switch (currentTheme) {
      case 'elegant':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-300 dark:border-purple-600',
          hover: 'hover:bg-purple-50 dark:hover:bg-purple-800'
        };
      case 'minimal':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-300 dark:border-gray-600',
          hover: 'hover:bg-gray-50 dark:hover:bg-gray-700'
        };
      default: // modern
        return {
          bg: 'bg-blue-100 dark:bg-blue-900',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-300 dark:border-blue-600',
          hover: 'hover:bg-blue-50 dark:hover:bg-blue-800'
        };
    }
  };
  
  const accentClasses = getAccentClasses();

  return (
    <div className="modern-template">
      {/* Contact Cards */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${themeColors.card[colorMode]} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${accentClasses.hover}`}>
            <div className="flex items-center mb-3">
              <div className={`p-3 rounded-full ${accentClasses.bg} mr-4`}>
                <FaPhone className={`${accentClasses.text} text-xl`} />
              </div>
              <h3 className={`font-semibold ${themeColors.text.primary[colorMode]}`}>Phone</h3>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full ${themeColors.text.primary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:${accentClasses.border} p-2 rounded`}
                placeholder="Phone number"
              />
            ) : (
              <p className={`${themeColors.text.primary[colorMode]} ${!displayData.phone ? 'text-gray-400 dark:text-gray-500 italic' : ''}`}>
                {displayData.phone || 'Not provided'}
              </p>
            )}
          </div>

          <div className={`${themeColors.card[colorMode]} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${accentClasses.hover}`}>
            <div className="flex items-center mb-3">
              <div className={`p-3 rounded-full ${accentClasses.bg} mr-4`}>
                <FaEnvelope className={`${accentClasses.text} text-xl`} />
              </div>
              <h3 className={`font-semibold ${themeColors.text.primary[colorMode]}`}>Email</h3>
            </div>
            {isEditing ? (
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full ${accentClasses.text} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:${accentClasses.border} p-2 rounded`}
                placeholder="Email address"
              />
            ) : (
              <a href={`mailto:${displayData.email}`} className={`${accentClasses.text} hover:underline`}>
                {displayData.email || 'Not provided'}
              </a>
            )}
          </div>

          <div className={`${themeColors.card[colorMode]} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${accentClasses.hover}`}>
            <div className="flex items-center mb-3">
              <div className={`p-3 rounded-full ${accentClasses.bg} mr-4`}>
                <FaGithub className={`${accentClasses.text} text-xl`} />
              </div>
              <h3 className={`font-semibold ${themeColors.text.primary[colorMode]}`}>GitHub</h3>
            </div>
            {isEditing ? (
              <input
                type="url"
                value={editData.github || ''}
                onChange={(e) => handleInputChange('github', e.target.value)}
                className={`w-full ${accentClasses.text} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:${accentClasses.border} p-2 rounded`}
                placeholder="GitHub URL"
              />
            ) : (
              <a href={displayData.github} target="_blank" rel="noopener noreferrer" className={`${accentClasses.text} hover:underline flex items-center`}>
                {displayData.github?.replace('https://github.com/', '')} <FaExternalLinkAlt className="ml-1" />
              </a>
            )}
          </div>

          <div className={`${themeColors.card[colorMode]} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${accentClasses.hover}`}>
            <div className="flex items-center mb-3">
              <div className={`p-3 rounded-full ${accentClasses.bg} mr-4`}>
                <FaLinkedin className={`${accentClasses.text} text-xl`} />
              </div>
              <h3 className={`font-semibold ${themeColors.text.primary[colorMode]}`}>LinkedIn</h3>
            </div>
            {isEditing ? (
              <input
                type="url"
                value={editData.linkedin || ''}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className={`w-full ${accentClasses.text} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:${accentClasses.border} p-2 rounded`}
                placeholder="LinkedIn URL"
              />
            ) : (
              <a href={displayData.linkedin} target="_blank" rel="noopener noreferrer" className={`${accentClasses.text} hover:underline flex items-center`}>
                {displayData.linkedin?.replace('https://www.linkedin.com/in/', '')} <FaExternalLinkAlt className="ml-1" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mb-12">
        <div className={`${themeColors.cardHover[colorMode]} p-8 rounded-2xl shadow-lg`}>
          <h2 className={`text-2xl font-bold ${accentClasses.text} mb-6 flex items-center`}>
            <FaStar className="mr-3" />
            About Me
          </h2>
          {isEditing ? (
            <textarea
              value={editData.summary || ''}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              className={`w-full p-4 border ${themeColors.input[colorMode]} rounded-lg ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:${accentClasses.border} resize-none`}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          ) : (
            <p className={`${themeColors.text.primary[colorMode]} leading-relaxed text-lg`}>
              {displayData.summary}
            </p>
          )}
        </div>
      </section>

      {/* Skills Grid */}
      <section className="mb-12">
        <h2 className={`text-2xl font-bold ${accentClasses.text} mb-6 flex items-center`}>
          <FaStar className="mr-3" />
          Skills & Expertise
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Technical Skills */}
          <div className={`${themeColors.cardHover[colorMode]} p-6 rounded-xl shadow-lg`}>
            <h3 className="text-xl font-semibold mb-4">Technical Skills</h3>
            {isEditing ? (
              <div className="space-y-3">
                {editData.skills?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${accentClasses.bg}`}></div>
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                      className={`flex-1 p-2 border ${accentClasses.border} rounded ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:${accentClasses.border}`}
                      placeholder="Skill"
                    />
                    <button
                      onClick={() => removeArrayItem('skills', index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('skills')}
                  className={`${accentClasses.text} text-sm font-medium`}
                >
                  + Add Skill
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {displayData.skills?.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className={`px-3 py-1 ${accentClasses.bg} ${accentClasses.text} rounded-full text-sm font-medium`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Areas of Expertise */}
          <div className={`${themeColors.cardHover[colorMode]} p-6 rounded-xl shadow-lg`}>
            <h3 className="text-xl font-semibold mb-4">Areas of Expertise</h3>
            {isEditing ? (
              <div className="space-y-3">
                {editData.expertise?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${accentClasses.bg}`}></div>
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                      className={`flex-1 p-2 border ${accentClasses.border} rounded ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:${accentClasses.border}`}
                      placeholder="Expertise"
                    />
                    <button
                      onClick={() => removeArrayItem('expertise', index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('expertise')}
                  className={`${accentClasses.text} text-sm font-medium`}
                >
                  + Add Expertise
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayData.expertise?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${accentClasses.bg} mr-3`}></div>
                    <span className={themeColors.text.primary[colorMode]}>{skill}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Education Timeline */}
      <section className="mb-12">
        <h2 className={`text-2xl font-bold ${accentClasses.text} mb-6 flex items-center`}>
          <FaStar className="mr-3" />
          Education
        </h2>
        <div className="space-y-6">
          {displayData.education?.map((edu: any, index: number) => (
            <div key={index} className={`${themeColors.cardHover[colorMode]} p-6 rounded-xl shadow-lg relative`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentClasses.bg} rounded-l-xl`}></div>
              <div className="pl-6">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => handleArrayChange('education', index, {...edu, degree: e.target.value})}
                      className={`w-full text-xl font-bold ${themeColors.text.primary[colorMode]} bg-transparent border-b ${accentClasses.border} focus:outline-none focus:${accentClasses.border}`}
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => handleArrayChange('education', index, {...edu, institution: e.target.value})}
                      className={`w-full text-lg ${themeColors.text.primary[colorMode]} bg-transparent border-b ${accentClasses.border} focus:outline-none focus:${accentClasses.border}`}
                      placeholder="Institution"
                    />
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={edu.duration || ''}
                        onChange={(e) => handleArrayChange('education', index, {...edu, duration: e.target.value})}
                        className={`flex-1 text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b ${accentClasses.border} focus:outline-none focus:${accentClasses.border}`}
                        placeholder="Duration"
                      />
                      <input
                        type="text"
                        value={edu.grade || ''}
                        onChange={(e) => handleArrayChange('education', index, {...edu, grade: e.target.value})}
                        className={`flex-1 text-sm ${themeColors.text.secondary[colorMode]} bg-transparent border-b ${accentClasses.border} focus:outline-none focus:${accentClasses.border}`}
                        placeholder="Grade"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold mb-2">{edu.degree}</h3>
                    <p className="text-lg mb-2">{edu.institution}</p>
                    <p className={`text-sm ${themeColors.text.secondary[colorMode]}`}>
                      {edu.duration} | {edu.grade}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="mb-12">
        <h2 className={`text-2xl font-bold ${accentClasses.text} mb-6 flex items-center`}>
          <FaStar className="mr-3" />
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayData.projects?.map((project: any, index: number) => (
            <div key={index} className={`${themeColors.cardHover[colorMode]} rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={project.title || ''}
                      onChange={(e) => handleArrayChange('projects', index, {...project, title: e.target.value})}
                      className={`w-full text-xl font-bold ${themeColors.text.primary[colorMode]} bg-transparent border-b ${accentClasses.border} focus:outline-none focus:${accentClasses.border}`}
                      placeholder="Project Title"
                    />
                    <textarea
                      value={project.description || ''}
                      onChange={(e) => handleArrayChange('projects', index, {...project, description: e.target.value})}
                      className={`w-full ${themeColors.text.secondary[colorMode]} bg-transparent border ${accentClasses.border} rounded p-3 focus:outline-none focus:${accentClasses.border} resize-none`}
                      placeholder="Project description"
                      rows={3}
                    />
                    <input
                      type="url"
                      value={project.link || ''}
                      onChange={(e) => handleArrayChange('projects', index, {...project, link: e.target.value})}
                      className={`w-full text-sm ${accentClasses.text} bg-transparent border-b ${accentClasses.border} focus:outline-none focus:${accentClasses.border}`}
                      placeholder="Project URL"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                    <p className={`${themeColors.text.secondary[colorMode]} mb-4`}>{project.description}</p>
                    {project.link && (
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center ${accentClasses.text} hover:underline font-medium`}
                      >
                        View Project <FaExternalLinkAlt className="ml-2" />
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ModernTemplate; 