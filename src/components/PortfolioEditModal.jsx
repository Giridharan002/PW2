import React, { useState } from 'react';
import { FaTimes, FaSave, FaUser, FaBriefcase, FaGraduationCap, FaProjectDiagram, FaCertificate, FaTrophy } from 'react-icons/fa';

const PortfolioEditModal = ({ portfolio, onSave, onClose, isOpen }) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [editData, setEditData] = useState({
    title: portfolio?.title || 'Professional Portfolio',
    header: {
      name: portfolio?.header?.name || '',
      shortAbout: portfolio?.header?.shortAbout || '',
      location: portfolio?.header?.location || '',
      contacts: {
        email: portfolio?.header?.contacts?.email || '',
        phone: portfolio?.header?.contacts?.phone || '',
        website: portfolio?.header?.contacts?.website || '',
        linkedin: portfolio?.header?.contacts?.linkedin || '',
        github: portfolio?.header?.contacts?.github || '',
        twitter: portfolio?.header?.contacts?.twitter || '',
      },
      skills: Array.isArray(portfolio?.header?.skills) ? portfolio.header.skills : [],
    },
    summary: portfolio?.summary || '',
    workExperience: Array.isArray(portfolio?.workExperience) ? portfolio.workExperience : [],
    education: Array.isArray(portfolio?.education) ? portfolio.education : [],
    extraSections: Array.isArray(portfolio?.extraSections) ? portfolio.extraSections : [],
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const sections = [
    { id: 'basic', name: 'Basic Info', icon: FaUser },
    { id: 'experience', name: 'Experience', icon: FaBriefcase },
    { id: 'education', name: 'Education', icon: FaGraduationCap },
    { id: 'projects', name: 'Projects', icon: FaProjectDiagram },
    { id: 'certificates', name: 'Certificates', icon: FaCertificate },
    { id: 'achievements', name: 'Achievements', icon: FaTrophy },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editData);
    } finally {
      setSaving(false);
    }
  };

  const addWorkExperience = () => {
    setEditData({
      ...editData,
      workExperience: [...editData.workExperience, {
        company: '',
        title: '',
        location: '',
        contract: 'Full-time',
        start: '',
        end: '',
        description: '',
        link: ''
      }]
    });
  };

  const updateWorkExperience = (index, field, value) => {
    const updated = [...editData.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, workExperience: updated });
  };

  const removeWorkExperience = (index) => {
    setEditData({
      ...editData,
      workExperience: editData.workExperience.filter((_, i) => i !== index)
    });
  };

  const addEducation = () => {
    setEditData({
      ...editData,
      education: [...editData.education, { school: '', degree: '', start: '', end: '' }]
    });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...editData.education];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, education: updated });
  };

  const removeEducation = (index) => {
    setEditData({
      ...editData,
      education: editData.education.filter((_, i) => i !== index)
    });
  };

  const addExtraSection = (sectionType) => {
    const sectionTitles = {
      projects: 'Projects',
      certificates: 'Certificates',
      achievements: 'Achievements'
    };
    setEditData({
      ...editData,
      extraSections: [...editData.extraSections, {
        key: `${sectionType}-${Date.now()}`,
        title: sectionTitles[sectionType] || 'New Section',
        items: []
      }]
    });
  };

  const updateExtraSectionTitle = (index, title) => {
    const updated = [...editData.extraSections];
    updated[index] = { ...updated[index], title };
    setEditData({ ...editData, extraSections: updated });
  };

  const addExtraItem = (sectionIndex) => {
    const updated = [...editData.extraSections];
    updated[sectionIndex].items.push({
      title: '',
      name: '',
      description: '',
      link: '',
      venue: '',
      year: '',
      tech: []
    });
    setEditData({ ...editData, extraSections: updated });
  };

  const updateExtraItem = (sectionIndex, itemIndex, field, value) => {
    const updated = [...editData.extraSections];
    updated[sectionIndex].items[itemIndex] = {
      ...updated[sectionIndex].items[itemIndex],
      [field]: value
    };
    setEditData({ ...editData, extraSections: updated });
  };

  const removeExtraItem = (sectionIndex, itemIndex) => {
    const updated = [...editData.extraSections];
    updated[sectionIndex].items = updated[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setEditData({ ...editData, extraSections: updated });
  };

  const removeExtraSection = (index) => {
    setEditData({
      ...editData,
      extraSections: editData.extraSections.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="border-b px-8 py-6 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FaUser />
                Edit Portfolio
              </h2>
              <p className="text-blue-100 mt-1">Update your portfolio information</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 font-semibold"
              >
                <FaSave />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 border-r bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Sections</h3>
              <div className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="text-lg" />
                      {section.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 max-h-[70vh] overflow-y-auto">
              {/* Basic Information */}
              {activeSection === 'basic' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Basic Information
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Title</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Professional Portfolio"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editData.header.name}
                        onChange={(e) => setEditData({ ...editData, header: { ...editData.header, name: e.target.value } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="GIRI DHARAN B"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Tagline</label>
                      <input
                        type="text"
                        value={editData.header.shortAbout}
                        onChange={(e) => setEditData({ ...editData, header: { ...editData.header, shortAbout: e.target.value } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Aspiring AI Engineer with expertise in Generative AI, model finetuning, and application development"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={editData.header.location}
                        onChange={(e) => setEditData({ ...editData, header: { ...editData.header, location: e.target.value } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tiruchengode, Namakkal, TN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                      <textarea
                        value={editData.summary}
                        onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                        placeholder="Write a brief summary about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Contact Information</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Email</label>
                          <input
                            type="email"
                            value={editData.header.contacts.email}
                            onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, email: e.target.value } } })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="giri.2004k@gmail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Phone</label>
                          <input
                            type="text"
                            value={editData.header.contacts.phone}
                            onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, phone: e.target.value } } })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="+91 6383608069"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Website</label>
                          <input
                            type="url"
                            value={editData.header.contacts.website}
                            onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, website: e.target.value } } })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://chatpulse.dev"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
                          <input
                            type="text"
                            value={editData.header.contacts.linkedin}
                            onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, linkedin: e.target.value } } })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="giri-dharan-667163260"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">GitHub</label>
                          <input
                            type="text"
                            value={editData.header.contacts.github}
                            onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, github: e.target.value } } })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Giridharan002"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Twitter</label>
                          <input
                            type="text"
                            value={editData.header.contacts.twitter}
                            onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, twitter: e.target.value } } })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="@username"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={editData.header.skills.join(', ')}
                        onChange={(e) => setEditData({
                          ...editData,
                          header: {
                            ...editData.header,
                            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Python, React, Node.js, AI, Machine Learning"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {activeSection === 'experience' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FaBriefcase className="text-blue-600" />
                      Work Experience
                    </h3>
                    <button
                      onClick={addWorkExperience}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      + Add Experience
                    </button>
                  </div>

                  <div className="space-y-6">
                    {editData.workExperience.map((exp, index) => (
                      <div key={index} className="border rounded-lg p-6 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-medium text-gray-600">Experience #{index + 1}</span>
                          <button
                            onClick={() => removeWorkExperience(index)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="Company"
                            value={exp.company || ''}
                            onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                          />
                          <input
                            placeholder="Job Title"
                            value={exp.title || ''}
                            onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                          />
                          <input
                            placeholder="Location"
                            value={exp.location || ''}
                            onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                          />
                          <input
                            placeholder="Contract Type"
                            value={exp.contract || ''}
                            onChange={(e) => updateWorkExperience(index, 'contract', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                          />
                          <input
                            placeholder="Start Date"
                            value={exp.start || ''}
                            onChange={(e) => updateWorkExperience(index, 'start', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                          />
                          <input
                            placeholder="End Date"
                            value={exp.end || ''}
                            onChange={(e) => updateWorkExperience(index, 'end', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                          />
                          <input
                            placeholder="Company Link"
                            value={exp.link || ''}
                            onChange={(e) => updateWorkExperience(index, 'link', e.target.value)}
                            className="px-3 py-2 border rounded-lg col-span-2"
                          />
                          <textarea
                            placeholder="Description"
                            value={exp.description || ''}
                            onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                            className="px-3 py-2 border rounded-lg col-span-2 min-h-[80px]"
                          />
                        </div>
                      </div>
                    ))}
                    {editData.workExperience.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <FaBriefcase className="mx-auto text-4xl mb-3 opacity-50" />
                        <p>No work experience added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FaGraduationCap className="text-blue-600" />
                      Education
                    </h3>
                    <button
                      onClick={addEducation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      + Add Education
                    </button>
                  </div>

                  <div className="space-y-6">
                    {editData.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-6 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-medium text-gray-600">Education #{index + 1}</span>
                          <button
                            onClick={() => removeEducation(index)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="School/University"
                            value={edu.school || ''}
                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                            className="px-3 py-2 border rounded-lg col-span-2"
                          />
                          <input
                            placeholder="Degree"
                            value={edu.degree || ''}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className="px-3 py-2 border rounded-lg col-span-2"
                          />
                          <input
                            placeholder="Start Year"
                            value={edu.start || ''}
                            onChange={(e) => updateEducation(index, 'start', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                          />
                          <input
                            placeholder="End Year"
                            value={edu.end || ''}
                            onChange={(e) => updateEducation(index, 'end', e.target.value)}
                            className="px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                    {editData.education.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <FaGraduationCap className="mx-auto text-4xl mb-3 opacity-50" />
                        <p>No education added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Projects, Certificates, Achievements - Extra Sections */}
              {['projects', 'certificates', 'achievements'].includes(activeSection) && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      {activeSection === 'projects' && <FaProjectDiagram className="text-blue-600" />}
                      {activeSection === 'certificates' && <FaCertificate className="text-blue-600" />}
                      {activeSection === 'achievements' && <FaTrophy className="text-blue-600" />}
                      {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </h3>
                    <button
                      onClick={() => addExtraSection(activeSection)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      + Add Section
                    </button>
                  </div>

                  <div className="space-y-6">
                    {editData.extraSections
                      .filter(section => section.key.includes(activeSection) || section.title.toLowerCase().includes(activeSection))
                      .map((section) => {
                        const actualIndex = editData.extraSections.indexOf(section);
                        return (
                          <div key={actualIndex} className="border rounded-lg p-6 bg-gray-50">
                            <div className="flex items-center gap-3 mb-4">
                              <input
                                placeholder="Section Title"
                                value={section.title}
                                onChange={(e) => updateExtraSectionTitle(actualIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg font-medium"
                              />
                              <button
                                onClick={() => addExtraItem(actualIndex)}
                                className="px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
                              >
                                + Item
                              </button>
                              <button
                                onClick={() => removeExtraSection(actualIndex)}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                              >
                                Remove Section
                              </button>
                            </div>

                            {section.items && section.items.map((item, iIndex) => (
                              <div key={iIndex} className="border rounded bg-white p-4 mb-3">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs text-gray-600">Item #{iIndex + 1}</span>
                                  <button
                                    onClick={() => removeExtraItem(actualIndex, iIndex)}
                                    className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    placeholder="Title/Name"
                                    value={item.title || item.name || ''}
                                    onChange={(e) => updateExtraItem(actualIndex, iIndex, 'title', e.target.value)}
                                    className="px-3 py-2 border rounded"
                                  />
                                  <input
                                    placeholder="Year"
                                    value={item.year || ''}
                                    onChange={(e) => updateExtraItem(actualIndex, iIndex, 'year', e.target.value)}
                                    className="px-3 py-2 border rounded"
                                  />
                                  <input
                                    placeholder="Link"
                                    value={item.link || ''}
                                    onChange={(e) => updateExtraItem(actualIndex, iIndex, 'link', e.target.value)}
                                    className="px-3 py-2 border rounded col-span-2"
                                  />
                                  <textarea
                                    placeholder="Description"
                                    value={item.description || ''}
                                    onChange={(e) => updateExtraItem(actualIndex, iIndex, 'description', e.target.value)}
                                    className="px-3 py-2 border rounded col-span-2 min-h-[60px]"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}

                    {editData.extraSections.filter(section =>
                      section.key.includes(activeSection) || section.title.toLowerCase().includes(activeSection)
                    ).length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <p>No {activeSection} added yet</p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioEditModal;
