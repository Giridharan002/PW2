import React, { useState } from 'react';
import { 
  FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaEye, FaEyeSlash,
  FaGripVertical, FaBold, FaItalic, FaUnderline, FaLink, FaImage,
  FaSave, FaTimes, FaCheck
} from 'react-icons/fa';

const DynamicTemplate = ({
  portfolio,
  isEditing,
  onSectionUpdate,
  onFieldUpdate,
  onItemUpdate,
  onAddItem,
  onRemoveItem,
  onAddSection,
  onRemoveSection,
  onReorderSection,
  theme = 'light'
}) => {
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  if (!portfolio || !portfolio.sections) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No portfolio data available</p>
      </div>
    );
  }

  const themeClasses = {
    light: {
      container: 'bg-white shadow-2xl',
      section: 'bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors',
      field: 'bg-white border-gray-300 hover:border-gray-400 transition-colors',
      text: 'text-gray-900',
      muted: 'text-gray-600',
      accent: 'text-blue-600',
      header: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    dark: {
      container: 'bg-gray-900 shadow-2xl border border-gray-700',
      section: 'bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors',
      field: 'bg-gray-800 border-gray-600 hover:border-gray-500 transition-colors',
      text: 'text-white',
      muted: 'text-gray-400',
      accent: 'text-blue-400',
      header: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white',
      button: 'bg-blue-700 hover:bg-blue-600 text-white',
      success: 'bg-green-900 text-green-200 border-green-700',
      warning: 'bg-yellow-900 text-yellow-200 border-yellow-700'
    },
    modern: {
      container: 'bg-white shadow-xl border-l-4 border-indigo-500',
      section: 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200',
      field: 'bg-white border-indigo-300 hover:border-indigo-400 transition-all',
      text: 'text-gray-900',
      muted: 'text-gray-600',
      accent: 'text-indigo-600',
      header: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      success: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      warning: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    elegant: {
      container: 'bg-slate-50 shadow-xl border border-slate-200',
      section: 'bg-white border-slate-200 hover:shadow-md transition-all',
      field: 'bg-slate-50 border-slate-300 hover:bg-white transition-colors',
      text: 'text-slate-900',
      muted: 'text-slate-600',
      accent: 'text-slate-700',
      header: 'bg-slate-800 text-white',
      button: 'bg-slate-700 hover:bg-slate-800 text-white',
      success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      warning: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    creative: {
      container: 'bg-gradient-to-br from-pink-50 to-orange-50 shadow-2xl border-2 border-pink-200',
      section: 'bg-white border-pink-200 hover:border-pink-300 transition-all rounded-xl',
      field: 'bg-gradient-to-r from-pink-50 to-orange-50 border-pink-300 hover:border-pink-400 transition-all rounded-lg',
      text: 'text-gray-900',
      muted: 'text-gray-600',
      accent: 'text-pink-600',
      header: 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white',
      button: 'bg-pink-600 hover:bg-pink-700 text-white',
      success: 'bg-pink-100 text-pink-800 border-pink-200',
      warning: 'bg-orange-100 text-orange-800 border-orange-200'
    }
  };

  // Get theme from portfolio or use default
  const themeKey = portfolio?.themeColor || theme || 'light';
  const currentTheme = themeClasses[themeKey] || themeClasses['light'];

  const startEditing = (sectionId, itemId, fieldKey, currentValue) => {
    const editKey = itemId ? `${sectionId}-${itemId}-${fieldKey}` : `${sectionId}-${fieldKey}`;
    setEditingField(editKey);
    setTempValue(Array.isArray(currentValue) ? currentValue.join(', ') : currentValue || '');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  const saveFieldEdit = (sectionId, itemId, fieldKey, fieldType) => {
    let processedValue = tempValue;
    
    // Process value based on field type
    if (fieldType === 'array') {
      processedValue = tempValue.split(',').map(item => item.trim()).filter(item => item);
    } else if (fieldType === 'number') {
      processedValue = parseFloat(tempValue) || 0;
    } else if (fieldType === 'boolean') {
      processedValue = tempValue.toLowerCase() === 'true';
    }

    if (itemId) {
      onItemUpdate(sectionId, itemId, fieldKey, processedValue);
    } else {
      onFieldUpdate(sectionId, fieldKey, processedValue);
    }

    cancelEditing();
  };

  const renderField = (field, sectionId, itemId = null) => {
    const editKey = itemId ? `${sectionId}-${itemId}-${field.key}` : `${sectionId}-${field.key}`;
  const isEditingField = editingField === editKey;
  const displayValue = Array.isArray(field.value) ? field.value.join(', ') : field.value;

    if (!field.isVisible && !isEditingField) return null;

    const fieldClasses = `
      ${currentTheme.field} 
      border rounded-lg p-3 
      ${isEditingField ? 'ring-2 ring-blue-500' : ''}
    `;

    return (
      <div key={field.key} className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className={`text-sm font-medium ${currentTheme.text}`}>
            {field.displayName || field.key}
          </label>
          {isEditingField && (
            <div className="flex gap-2">
              <button
                onClick={() => saveFieldEdit(sectionId, itemId, field.key, field.type)}
                className="text-green-600 hover:text-green-700 p-1"
                title="Save"
              >
                <FaCheck />
              </button>
              <button
                onClick={cancelEditing}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Cancel"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        {isEditingField ? (
          <div className={fieldClasses}>
            {field.type === 'richtext' ? (
              <div>
                <div className="flex gap-2 mb-2 border-b pb-2">
                  <button className="text-gray-600 hover:text-gray-800 p-1">
                    <FaBold />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 p-1">
                    <FaItalic />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 p-1">
                    <FaUnderline />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 p-1">
                    <FaLink />
                  </button>
                </div>
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full min-h-[100px] resize-vertical border-0 outline-none"
                  placeholder={`Enter ${field.displayName || field.key}...`}
                />
              </div>
            ) : field.type === 'array' ? (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full border-0 outline-none"
                placeholder="Enter items separated by commas..."
              />
            ) : (
              <input
                type={field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : 'text'}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full border-0 outline-none"
                placeholder={`Enter ${field.displayName || field.key}...`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    saveFieldEdit(sectionId, itemId, field.key, field.type);
                  }
                }}
              />
            )}
          </div>
        ) : (
          <div
            className={`${fieldClasses} cursor-pointer hover:shadow-sm transition-shadow`}
            onClick={() => isEditing && startEditing(sectionId, itemId, field.key, field.value)}
          >
            {field.type === 'array' && Array.isArray(field.value) ? (
              <div className="flex flex-wrap gap-2">
                {field.value.map((item, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
                {field.value.length === 0 && (
                  <span className={currentTheme.muted}>No items yet...</span>
                )}
              </div>
            ) : field.type === 'url' && field.value ? (
              <a
                href={field.value}
                target="_blank"
                rel="noopener noreferrer"
                className={`${currentTheme.accent} hover:underline`}
                onClick={(e) => isEditingField && e.preventDefault()}
              >
                {field.value}
              </a>
            ) : field.type === 'richtext' ? (
              <div 
                className={`prose max-w-none ${currentTheme.text}`}
                dangerouslySetInnerHTML={{ __html: field.value || `<p class="${currentTheme.muted}">No content yet...</p>` }}
              />
            ) : (
              <span className={field.value ? currentTheme.text : currentTheme.muted}>
                {displayValue || `No ${field.displayName || field.key} yet...`}
              </span>
            )}
          </div>
        )}

      </div>
    );
  };

  const renderItem = (item, sectionId) => {
    if (!item.fields) return null;

    return (
      <div
        key={item.id}
        className={`${currentTheme.field} border rounded-lg p-4 mb-4 relative group`}
      >
        {isEditing && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRemoveItem(sectionId, item.id)}
              className="text-red-500 hover:text-red-700 p-1 bg-white rounded shadow"
              title="Remove Item"
            >
              <FaTrash size={12} />
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {item.fields
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(field => renderField(field, sectionId, item.id))}
        </div>

        {isEditing && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => startEditing(sectionId, item.id, 'new', '')}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
            >
              <FaEdit size={12} />
              Edit Fields
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section) => {
    if (!section.isVisible && !isEditing) return null;

    const sectionFields = (section.fields || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    const sectionItems = (section.items || []).sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div
        key={section.id}
        className={`${currentTheme.section} border rounded-lg p-6 mb-6 relative group`}
      >
        {/* Section Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
              {section.title}
            </h2>
            {section.subtitle && (
              <p className={`${currentTheme.muted} text-sm`}>
                {section.subtitle}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onReorderSection(section.id, 'up')}
                className="text-gray-500 hover:text-gray-700 p-2 bg-white rounded shadow"
                title="Move Up"
              >
                <FaArrowUp size={12} />
              </button>
              <button
                onClick={() => onReorderSection(section.id, 'down')}
                className="text-gray-500 hover:text-gray-700 p-2 bg-white rounded shadow"
                title="Move Down"
              >
                <FaArrowDown size={12} />
              </button>
              <button
                onClick={() => {
                  const newTitle = prompt('Enter section title:', section.title);
                  if (newTitle && newTitle !== section.title) {
                    onSectionUpdate(section.id, { title: newTitle });
                  }
                }}
                className="text-blue-500 hover:text-blue-700 p-2 bg-white rounded shadow"
                title="Edit Section"
              >
                <FaEdit size={12} />
              </button>
              <button
                onClick={() => {
                  const newVisibility = !section.isVisible;
                  onSectionUpdate(section.id, { isVisible: newVisibility });
                }}
                className={`p-2 bg-white rounded shadow ${
                  section.isVisible 
                    ? 'text-green-500 hover:text-green-700' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={section.isVisible ? 'Hide Section' : 'Show Section'}
              >
                {section.isVisible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
              </button>
              <button
                onClick={() => onRemoveSection(section.id)}
                className="text-red-500 hover:text-red-700 p-2 bg-white rounded shadow"
                title="Remove Section"
              >
                <FaTrash size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Section Fields */}
        {sectionFields.length > 0 && (
          <div className="mb-6">
            {sectionFields.map(field => renderField(field, section.id))}
          </div>
        )}

        {/* Section Items */}
        {sectionItems.length > 0 && (
          <div className="space-y-4">
            {sectionItems.map(item => renderItem(item, section.id))}
          </div>
        )}

        {/* Add Item Button */}
        {isEditing && (section.type === 'experience' || section.type === 'education' || section.type === 'projects' || section.items) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => onAddItem(section.id)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FaPlus size={14} />
              Add {section.type === 'experience' ? 'Experience' : 
                   section.type === 'education' ? 'Education' : 
                   section.type === 'projects' ? 'Project' : 'Item'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const sortedSections = [...portfolio.sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className={`${currentTheme.container} rounded-lg shadow-lg overflow-hidden`}>
      {/* Portfolio Header */}
      <div className={`p-8 border-b ${currentTheme.header} rounded-t-lg`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-sm">
              {portfolio.title || 'Dynamic Portfolio'}
            </h1>
            {portfolio.subtitle && (
              <p className="text-xl text-white opacity-90">
                {portfolio.subtitle}
              </p>
            )}
            {portfolio.description && (
              <p className="mt-4 text-white opacity-80 max-w-2xl">
                {portfolio.description}
              </p>
            )}
          </div>
          
          {portfolio.profileImage && (
            <img
              src={portfolio.profileImage}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
            />
          )}
        </div>

        {/* Portfolio Metadata */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          {portfolio.completenessScore && (
            <div className={`${currentTheme.success} px-3 py-1 rounded-full border`}>
              <span className="font-medium">Completeness:</span>
              <span className="font-bold ml-1">{portfolio.completenessScore}%</span>
            </div>
          )}
          {portfolio.aiConfidence && (
            <div className={`bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 rounded-full border`}>
              <span className="font-medium">AI Confidence:</span>
              <span className="font-bold ml-1">{Math.round(portfolio.aiConfidence * 100)}%</span>
            </div>
          )}
          <div className={`bg-gray-100 text-gray-800 border-gray-200 px-3 py-1 rounded-full border`}>
            <span className="font-medium">Updated:</span>
            <span className="font-bold ml-1">{new Date(portfolio.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Portfolio Sections */}
      <div className="p-8">
        {sortedSections.length > 0 ? (
          sortedSections.map(section => renderSection(section))
        ) : (
          <div className="text-center py-12">
            <p className={`${currentTheme.muted} text-lg mb-4`}>
              No sections available yet
            </p>
            {isEditing && (
              <button
                onClick={onAddSection}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <FaPlus />
                Add Your First Section
              </button>
            )}
          </div>
        )}

        {/* Add Section Button */}
        {isEditing && sortedSections.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={onAddSection}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Add New Section
            </button>
          </div>
        )}
      </div>

      {/* Edit Mode Indicator */}
      {isEditing && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4 text-center">
          <p className="text-yellow-800 font-medium">
            🎨 Edit Mode Active - Click on any field to edit, use section controls to manage layout
          </p>
        </div>
      )}
    </div>
  );
};

export default DynamicTemplate;
