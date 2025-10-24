import React from "react";
import { FaEdit, FaSave, FaTimes, FaEye } from "react-icons/fa";

const EditButtons = ({ 
  isEditing, 
  onToggleEdit,
  onSave, 
  saving = false
}) => {
  return (
    <div className="flex items-center space-x-2">
      {isEditing ? (
        <>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium transition-colors"
          >
            <FaSave className="text-sm" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={onToggleEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
          >
            <FaEye className="text-sm" />
            <span>Preview</span>
          </button>
        </>
      ) : (
        <button
          onClick={onToggleEdit}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
        >
          <FaEdit className="text-sm" />
          <span>Edit</span>
        </button>
      )}
    </div>
  );
};

export default EditButtons;
