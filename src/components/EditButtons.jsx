import React from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { getThemeColors } from "../utils/themes";

const EditButtons = ({ 
  isEditing, 
  handleEdit, 
  handleSave, 
  handleCancel, 
  setEditData, 
  editData,
  currentTheme,
  theme: colorMode
}) => {
  const themeColors = getThemeColors(currentTheme, colorMode);

  return (
    <>
      {/* Additional Sections for Projects and Experience editing */}
      {isEditing && (
        <div className="mb-10 space-y-6">
          {/* Add Project Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const newProject = { title: '', description: '', link: '' };
                setEditData(prev => ({
                  ...prev,
                  projects: [...(prev.projects || []), newProject]
                }));
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              + Add New Project
            </button>
          </div>

          {/* Add Education Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const newEducation = { degree: '', institution: '', duration: '', grade: '' };
                setEditData(prev => ({
                  ...prev,
                  education: [...(prev.education || []), newEducation]
                }));
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              + Add Education
            </button>
          </div>

          {/* Add Experience Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const newExperience = { title: '', company: '', duration: '', description: '' };
                setEditData(prev => ({
                  ...prev,
                  experience: [...(prev.experience || []), newExperience]
                }));
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              + Add Experience
            </button>
          </div>

          {/* Add Certification Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const newCertification = { name: '', issuer: '', date: '' };
                setEditData(prev => ({
                  ...prev,
                  certifications: [...(prev.certifications || []), newCertification]
                }));
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              + Add Certification
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex justify-center gap-4 mt-8 pt-6 border-t ${themeColors.border[colorMode]}`}>
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <FaSave /> Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <FaEdit /> Edit Portfolio
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default EditButtons; 