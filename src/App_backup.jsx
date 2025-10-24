import React, { useState, useEffect } from "react";
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import CreatePortfolio from './components/CreatePortfolio';
import Portfolio from './components/templates/Portfolio';
import Login from './components/Login';
import PDFUpload from "./components/PDFUpload";
import Header from "./components/Header";
import ContactInfo from "./components/ContactInfo";
import CareerObjective from "./components/CareerObjective";
import Education from "./components/Education";
import Projects from "./components/Projects";
import SkillsSection from "./components/SkillsSection";
import Experience from "./components/Experience";
import Certifications from "./components/Certifications";
import Languages from "./components/Languages";
import Achievements from "./components/Achievements";
import EditButtons from "./components/EditButtons";
import Footer from "./components/Footer";
import ClassicTemplate from "./components/templates/ClassicTemplate";
import ModernTemplate from "./components/templates/ModernTemplate";
import ElegantTemplate from "./components/templates/ElegantTemplate";
import { defaultData } from "./utils/defaultData";
import { getThemeColors } from "./utils/themes";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const [theme, setTheme] = useState('light');
  const [currentTheme, setCurrentTheme] = useState('modern');
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [portfolioData, setPortfolioData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
  };

  // Save preferences to localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedCurrentTheme = localStorage.getItem('currentTheme');
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedCurrentTheme) {
      setCurrentTheme(savedCurrentTheme);
    }
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('currentTheme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('selectedTemplate', selectedTemplate);
  }, [selectedTemplate]);

  const handleDataExtracted = (data) => {
    setPortfolioData(data);
    setEditData(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setPortfolioData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(portfolioData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setEditData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const currentData = portfolioData || defaultData;
  const displayData = isEditing ? editData : currentData;
  const themeColors = getThemeColors(currentTheme, theme);

  // Template props for all templates
  const templateProps = {
    displayData,
    isEditing,
    editData,
    handleInputChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    currentTheme,
    theme
  };

  // Render the appropriate template
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'classic':
        return <ClassicTemplate {...templateProps} />;
      case 'modern':
        return <ModernTemplate {...templateProps} />;
      case 'elegant':
        return <ElegantTemplate {...templateProps} />;
      default:
        return (
          <>
            <ContactInfo 
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleInputChange={handleInputChange}
              currentTheme={currentTheme}
              theme={theme}
            />

            <CareerObjective 
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleInputChange={handleInputChange}
              currentTheme={currentTheme}
              theme={theme}
            />

            <Education 
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleArrayChange={handleArrayChange}
              currentTheme={currentTheme}
              theme={theme}
            />

            <Projects 
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleArrayChange={handleArrayChange}
              currentTheme={currentTheme}
              theme={theme}
            />

            <SkillsSection 
              title="Expertise"
              field="expertise"
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleArrayChange={handleArrayChange}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              currentTheme={currentTheme}
              theme={theme}
            />

            <SkillsSection 
              title="Tools & Technologies"
              field="skills"
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleArrayChange={handleArrayChange}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              currentTheme={currentTheme}
              theme={theme}
            />

            <Experience 
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleArrayChange={handleArrayChange}
              currentTheme={currentTheme}
              theme={theme}
            />

            <Certifications 
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleArrayChange={handleArrayChange}
              currentTheme={currentTheme}
              theme={theme}
            />

            <Languages 
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleArrayChange={handleArrayChange}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              currentTheme={currentTheme}
              theme={theme}
            />

            <Achievements 
              displayData={displayData}
              isEditing={isEditing}
              editData={editData}
              handleArrayChange={handleArrayChange}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              currentTheme={currentTheme}
              theme={theme}
            />
          </>
        );
    }
  };

return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreatePortfolio />} />
            <Route path="/edit/:id" element={<Portfolio />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
      {/* Top Navigation */}
      <TopNav 
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        theme={theme}
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />
      
      <div className={`min-h-screen p-4 md:p-8 ${themeColors.background[theme]} transition-all duration-300 font-['Poppins',sans-serif]`}>
        <div className={`max-w-4xl mx-auto ${themeColors.card[theme]} rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300`}>
          
          <Header 
            displayData={displayData}
            isEditing={isEditing}
            editData={editData}
            handleInputChange={handleInputChange}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            toggleTheme={toggleTheme}
            theme={theme}
            portfolioData={portfolioData}
            currentTheme={currentTheme}
          />

          <div className="p-6 md:p-8">
            {/* PDF Upload Section - Only show if no portfolio data */}
            {!portfolioData && (
              <PDFUpload onDataExtracted={handleDataExtracted} theme={theme} />
            )}

            {/* Render the selected template */}
            {renderTemplate()}

            <EditButtons 
              isEditing={isEditing}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
              setEditData={setEditData}
              editData={editData}
              currentTheme={currentTheme}
              theme={theme}
            />

            {/* Upload New Resume Button */}
            {portfolioData && !isEditing && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    setPortfolioData(null);
                    setEditData({});
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Upload New Resume
                </button>
              </div>
            )}

            <Footer portfolioData={portfolioData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;

