import React from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { getThemeColors } from "../utils/themes";

const Header = ({ 
  displayData, 
  isEditing, 
  editData, 
  handleInputChange, 
  handleEdit, 
  handleSave, 
  handleCancel, 
  toggleTheme, 
  theme: colorMode,
  portfolioData,
  currentTheme
}) => {
  const themeColors = getThemeColors(currentTheme, colorMode);
  const headerGradient = themeColors.gradients.header;

  return (
    <header className={`relative bg-gradient-to-br ${headerGradient} text-white p-8 md:p-12 text-center overflow-hidden`}>
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"
        }}
      ></div>
      
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 bg-white bg-opacity-20 hover:bg-opacity-30 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-white text-xl transition-all duration-300 z-10"
      >
        {colorMode === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Edit Toggle - Top Right */}
      {portfolioData && (
        <button
          onClick={isEditing ? handleSave : handleEdit}
          className="absolute top-5 right-16 bg-white bg-opacity-20 hover:bg-opacity-30 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-white text-lg transition-all duration-300 z-10"
        >
          {isEditing ? <FaSave /> : <FaEdit />}
        </button>
      )}

      {isEditing && (
        <button
          onClick={handleCancel}
          className="absolute top-5 right-28 bg-white bg-opacity-20 hover:bg-opacity-30 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-white text-lg transition-all duration-300 z-10"
        >
          <FaTimes />
        </button>
      )}

      {isEditing ? (
        <>
          <input
            type="text"
            value={editData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="text-4xl md:text-5xl font-bold mb-2 relative z-10 bg-transparent border-b-2 border-white/30 text-center text-white placeholder-white/70 focus:outline-none focus:border-white"
            placeholder="Full Name"
          />
          <input
            type="text"
            value={editData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="text-xl md:text-2xl font-normal mb-6 relative z-10 bg-transparent border-b-2 border-white/30 text-center text-white placeholder-white/70 focus:outline-none focus:border-white mt-4"
            placeholder="Professional Title"
          />
        </>
      ) : (
        <>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 relative z-10">
            {displayData.name}
          </h1>
          <p className="text-xl md:text-2xl font-normal mb-6 relative z-10">
            {displayData.title}
          </p>
        </>
      )}
    </header>
  );
};

export default Header; 