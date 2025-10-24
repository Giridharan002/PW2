import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";
import { getThemeColors } from "../utils/themes";

const ContactInfo = ({ displayData, isEditing, editData, handleInputChange, currentTheme, theme: colorMode }) => {
  const themeColors = getThemeColors(currentTheme, colorMode);
  const accentColor = colorMode === 'light' ? themeColors.accent : themeColors.accentDark;

  return (
    <section className="mb-10">
      <h2 className={`text-${accentColor} text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-${accentColor}`}>
        Contact Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className={`flex items-center p-4 ${themeColors.cardHover[colorMode]} rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
          <div className={`text-2xl text-${accentColor} mr-4`}>
            <FaPhone />
          </div>
          <div className="flex-1">
            <p className={`text-sm ${themeColors.text.secondary[colorMode]} mb-1`}>Phone</p>
            {isEditing ? (
              <input
                type="text"
                value={editData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`text-base font-medium ${themeColors.text.primary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor} w-full`}
                placeholder="Phone number"
              />
            ) : (
              <p className={`text-base font-medium ${themeColors.text.primary[colorMode]}`}>{displayData.phone}</p>
            )}
          </div>
        </div>
        
        <div className={`flex items-center p-4 ${themeColors.cardHover[colorMode]} rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
          <div className={`text-2xl text-${accentColor} mr-4`}>
            <FaEnvelope />
          </div>
          <div className="flex-1">
            <p className={`text-sm ${themeColors.text.secondary[colorMode]} mb-1`}>Email</p>
            {isEditing ? (
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`text-base font-medium text-${accentColor} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor} w-full`}
                placeholder="Email address"
              />
            ) : (
              <p className="text-base font-medium">
                <a 
                  href={`mailto:${displayData.email}`}
                  className={`text-${accentColor} hover:underline flex items-center`}
                >
                  {displayData.email}
                </a>
              </p>
            )}
          </div>
        </div>
        
        <div className={`flex items-center p-4 ${themeColors.cardHover[colorMode]} rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
          <div className={`text-2xl text-${accentColor} mr-4`}>
            <FaGithub />
          </div>
          <div className="flex-1">
            <p className={`text-sm ${themeColors.text.secondary[colorMode]} mb-1`}>GitHub</p>
            {isEditing ? (
              <input
                type="url"
                value={editData.github || ''}
                onChange={(e) => handleInputChange('github', e.target.value)}
                className={`text-base font-medium text-${accentColor} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor} w-full`}
                placeholder="GitHub URL"
              />
            ) : (
              <p className="text-base font-medium">
                <a 
                  href={displayData.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-${accentColor} hover:underline flex items-center`}
                >
                  {displayData.github?.replace('https://github.com/', '')} <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </p>
            )}
          </div>
        </div>
        
        <div className={`flex items-center p-4 ${themeColors.cardHover[colorMode]} rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
          <div className={`text-2xl text-${accentColor} mr-4`}>
            <FaLinkedin />
          </div>
          <div className="flex-1">
            <p className={`text-sm ${themeColors.text.secondary[colorMode]} mb-1`}>LinkedIn</p>
            {isEditing ? (
              <input
                type="url"
                value={editData.linkedin || ''}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className={`text-base font-medium text-${accentColor} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor} w-full`}
                placeholder="LinkedIn URL"
              />
            ) : (
              <p className="text-base font-medium">
                <a 
                  href={displayData.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-${accentColor} hover:underline flex items-center`}
                >
                  {displayData.linkedin?.replace('https://www.linkedin.com/in/', '')} <FaExternalLinkAlt className="ml-1 text-xs" />
                </a>
              </p>
            )}
          </div>
        </div>
        
        <div className={`flex items-center p-4 ${themeColors.cardHover[colorMode]} rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:col-span-2`}>
          <div className={`text-2xl text-${accentColor} mr-4`}>
            <FaMapMarkerAlt />
          </div>
          <div className="flex-1">
            <p className={`text-sm ${themeColors.text.secondary[colorMode]} mb-1`}>Address</p>
            {isEditing ? (
              <textarea
                value={editData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`text-base font-medium ${themeColors.text.primary[colorMode]} bg-transparent border-b ${themeColors.input[colorMode]} focus:outline-none focus:border-${accentColor} w-full resize-none`}
                placeholder="Address"
                rows="2"
              />
            ) : (
              <p className={`text-base font-medium ${themeColors.text.primary[colorMode]}`}>
                {displayData.address}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo; 