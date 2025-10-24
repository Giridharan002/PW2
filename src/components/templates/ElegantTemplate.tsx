import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaExternalLinkAlt, FaCrown } from "react-icons/fa";
import { getThemeColors } from "../../utils/themes";

interface ElegantTemplateProps {
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

const ElegantTemplate: React.FC<ElegantTemplateProps> = ({
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
    <div className="elegant-template">
      {/* Elegant Header Section */}
      <section className="mb-16 text-center">
        <div className={`${themeColors.cardHover[colorMode]} p-12 rounded-3xl shadow-2xl relative overflow-hidden`}>
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 border-2 border-current rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-2 border-current rounded-full translate-x-12 translate-y-12"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-wide">
              {displayData.name}
            </h1>
            <p className="text-xl md:text-2xl font-light mb-8 text-gray-600 dark:text-gray-400 tracking-wide">
              {displayData.title}
            </p>
            
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <FaPhone className={`text-${accentColor} text-lg`} />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor} ${themeColors.text.primary[colorMode]}`}
                    placeholder="Phone"
                  />
                ) : (
                  <span className={themeColors.text.primary[colorMode]}>{displayData.phone}</span>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <FaEnvelope className={`text-${accentColor} text-lg`} />
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor} text-${accentColor}`}
                    placeholder="Email"
                  />
                ) : (
                  <a href={`mailto:${displayData.email}`} className={`text-${accentColor} hover:underline`}>
                    {displayData.email}
                  </a>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <FaMapMarkerAlt className={`text-${accentColor} text-lg`} />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor} ${themeColors.text.primary[colorMode]}`}
                    placeholder="Location"
                  />
                ) : (
                  <span className={themeColors.text.primary[colorMode]}>{displayData.address}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-light text-${accentColor} mb-4 tracking-wide`}>
            <FaCrown className="inline mr-3" />
            About
          </h2>
          <div className={`w-24 h-1 bg-${accentColor} mx-auto`}></div>
        </div>
        
        <div className={`${themeColors.cardHover[colorMode]} p-10 rounded-2xl shadow-xl max-w-4xl mx-auto`}>
          {isEditing ? (
            <textarea
              value={editData.summary || ''}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              className={`w-full p-6 border border-gray-300 dark:border-gray-600 rounded-xl ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:border-${accentColor} resize-none text-lg leading-relaxed`}
              placeholder="Share your story..."
              rows="5"
            />
          ) : (
            <p className={`${themeColors.text.primary[colorMode]} text-lg leading-relaxed text-center italic`}>
              "{displayData.summary}"
            </p>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-light text-${accentColor} mb-4 tracking-wide`}>
            <FaCrown className="inline mr-3" />
            Expertise
          </h2>
          <div className={`w-24 h-1 bg-${accentColor} mx-auto`}></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Technical Skills */}
          <div className={`${themeColors.cardHover[colorMode]} p-8 rounded-2xl shadow-xl`}>
            <h3 className="text-2xl font-light mb-6 text-center">Technical Skills</h3>
            {isEditing ? (
              <div className="space-y-4">
                {editData.skills?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full bg-${accentColor}`}></div>
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                      className={`flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:border-${accentColor}`}
                      placeholder="Skill"
                    />
                    <button
                      onClick={() => removeArrayItem('skills', index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('skills')}
                  className={`w-full text-${accentColor} text-sm font-medium py-2 border border-${accentColor} border-dashed rounded-lg hover:bg-${accentColor} hover:bg-opacity-10 transition-colors`}
                >
                  + Add Skill
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayData.skills?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full bg-${accentColor}`}></div>
                    <span className={`${themeColors.text.primary[colorMode]} text-lg`}>{skill}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Areas of Expertise */}
          <div className={`${themeColors.cardHover[colorMode]} p-8 rounded-2xl shadow-xl`}>
            <h3 className="text-2xl font-light mb-6 text-center">Areas of Expertise</h3>
            {isEditing ? (
              <div className="space-y-4">
                {editData.expertise?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full bg-${accentColor}`}></div>
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                      className={`flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg ${themeColors.text.primary[colorMode]} bg-transparent focus:outline-none focus:border-${accentColor}`}
                      placeholder="Expertise"
                    />
                    <button
                      onClick={() => removeArrayItem('expertise', index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('expertise')}
                  className={`w-full text-${accentColor} text-sm font-medium py-2 border border-${accentColor} border-dashed rounded-lg hover:bg-${accentColor} hover:bg-opacity-10 transition-colors`}
                >
                  + Add Expertise
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayData.expertise?.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full bg-${accentColor}`}></div>
                    <span className={`${themeColors.text.primary[colorMode]} text-lg`}>{skill}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Education Timeline */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-light text-${accentColor} mb-4 tracking-wide`}>
            <FaCrown className="inline mr-3" />
            Education
          </h2>
          <div className={`w-24 h-1 bg-${accentColor} mx-auto`}></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {displayData.education?.map((edu: any, index: number) => (
            <div key={index} className={`${themeColors.cardHover[colorMode]} p-8 rounded-2xl shadow-xl mb-8 relative`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-${accentColor} to-${accentColor} opacity-50 rounded-l-2xl`}></div>
              <div className="pl-8">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => handleArrayChange('education', index, {...edu, degree: e.target.value})}
                      className={`w-full text-2xl font-light ${themeColors.text.primary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Degree"
                    />
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => handleArrayChange('education', index, {...edu, institution: e.target.value})}
                      className={`w-full text-xl ${themeColors.text.primary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Institution"
                    />
                    <div className="flex gap-6">
                      <input
                        type="text"
                        value={edu.duration || ''}
                        onChange={(e) => handleArrayChange('education', index, {...edu, duration: e.target.value})}
                        className={`flex-1 text-lg ${themeColors.text.secondary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                        placeholder="Duration"
                      />
                      <input
                        type="text"
                        value={edu.grade || ''}
                        onChange={(e) => handleArrayChange('education', index, {...edu, grade: e.target.value})}
                        className={`flex-1 text-lg ${themeColors.text.secondary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                        placeholder="Grade"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-light mb-3">{edu.degree}</h3>
                    <p className="text-xl mb-3">{edu.institution}</p>
                    <p className={`text-lg ${themeColors.text.secondary[colorMode]} italic`}>
                      {edu.duration} | {edu.grade}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-light text-${accentColor} mb-4 tracking-wide`}>
            <FaCrown className="inline mr-3" />
            Projects
          </h2>
          <div className={`w-24 h-1 bg-${accentColor} mx-auto`}></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayData.projects?.map((project: any, index: number) => (
            <div key={index} className={`${themeColors.cardHover[colorMode]} rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}>
              <div className="p-8">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={project.title || ''}
                      onChange={(e) => handleArrayChange('projects', index, {...project, title: e.target.value})}
                      className={`w-full text-2xl font-light ${themeColors.text.primary[colorMode]} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Project Title"
                    />
                    <textarea
                      value={project.description || ''}
                      onChange={(e) => handleArrayChange('projects', index, {...project, description: e.target.value})}
                      className={`w-full ${themeColors.text.secondary[colorMode]} bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-4 focus:outline-none focus:border-${accentColor} resize-none`}
                      placeholder="Project description"
                      rows="4"
                    />
                    <input
                      type="url"
                      value={project.link || ''}
                      onChange={(e) => handleArrayChange('projects', index, {...project, link: e.target.value})}
                      className={`w-full text-lg text-${accentColor} bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-${accentColor}`}
                      placeholder="Project URL"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-light mb-4">{project.title}</h3>
                    <p className={`${themeColors.text.secondary[colorMode]} text-lg mb-6 leading-relaxed`}>
                      {project.description}
                    </p>
                    {project.link && (
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center text-${accentColor} hover:underline text-lg font-medium`}
                      >
                        Explore Project <FaExternalLinkAlt className="ml-2" />
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

export default ElegantTemplate; 