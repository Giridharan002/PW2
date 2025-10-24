import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaCopy, FaShare, FaDownload, FaPalette, FaCog, FaArrowLeft, FaExclamationTriangle, FaGlobe, FaEnvelope, FaPhone, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import portfolioService from '../services/portfolioService.js';
import { API_BASE_URL } from '../config/api.js';
import { getThemeColors } from '../utils/themes';
import PortfolioCustomizer from './PortfolioCustomizer.jsx';
import PortfolioEditModal from './PortfolioEditModal.jsx';

const PortfolioDisplay = ({ portfolio: propPortfolio, onEdit, onDelete, onDuplicate }) => {
    const { user, loading: authLoading } = useAuth();
    const { portfolioId, slug } = useParams();
    const navigate = useNavigate();

    // State for portfolio data
    const [portfolio, setPortfolio] = useState(propPortfolio);
    const [loading, setLoading] = useState(!propPortfolio);
    const [error, setError] = useState(null);
    const [isPublished, setIsPublished] = useState(portfolio?.isPublished || false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef(null);

    // Local edit state
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState(null);

    // Customization state
    const [customization, setCustomization] = useState({
        template: 'modern-clean',
        theme: { name: 'Ocean Blue', gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50' },
        colors: {
            heading: '#000000',
            subheading: '#333333',
            paragraph: '#555555',
            headerBg: '#ffffff',
            bodyBg: '#f9f9f9',
        }
    });

    // Debug: Log customization changes
    useEffect(() => {
        console.log('Customization state updated:', customization);
    }, [customization]);

    // Fetch portfolio data if not provided as prop
    useEffect(() => {
        const fetchPortfolio = async () => {
            if (propPortfolio) {
                setPortfolio(propPortfolio);
                setLoading(false);
                return;
            }

            if (!portfolioId && !slug) {
                setError('No portfolio identifier provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                let response;

                if (portfolioId) {
                    if (!user || !user.sessionId) {
                        setError('User not authenticated');
                        setLoading(false);
                        return;
                    }
                    response = await portfolioService.getPortfolio(user.sessionId, portfolioId);
                } else if (slug) {
                    response = await portfolioService.getPublicPortfolio(slug);
                }

                if (response.success && response.portfolio) {
                    setPortfolio(response.portfolio);
                    setIsPublished(response.portfolio.isPublished);
                } else {
                    setError('Portfolio not found');
                }
            } catch (err) {
                setError(err.message || 'Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [propPortfolio, portfolioId, slug, user]);

    // When portfolio changes, reset edit buffer
    useEffect(() => {
        if (portfolio) {
            setEditData({
                header: {
                    name: portfolio.header?.name || '',
                    shortAbout: portfolio.header?.shortAbout || '',
                    location: portfolio.header?.location || '',
                    contacts: {
                        website: portfolio.header?.contacts?.website || '',
                        email: portfolio.header?.contacts?.email || '',
                        phone: portfolio.header?.contacts?.phone || '',
                        twitter: portfolio.header?.contacts?.twitter || '',
                        linkedin: portfolio.header?.contacts?.linkedin || '',
                        github: portfolio.header?.contacts?.github || ''
                    },
                    skills: Array.isArray(portfolio.header?.skills) ? portfolio.header.skills : []
                },
                summary: portfolio.summary || '',
                workExperience: Array.isArray(portfolio.workExperience) ? portfolio.workExperience.map(w => ({ ...w })) : [],
                education: Array.isArray(portfolio.education) ? portfolio.education.map(e => ({ ...e })) : [],
                extraSections: Array.isArray(portfolio.extraSections) ? portfolio.extraSections.map(s => ({
                    key: s.key,
                    title: s.title,
                    items: Array.isArray(s.items) ? s.items.map(i => ({ ...i })) : []
                })) : []
            });
        }
    }, [portfolio]);

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEditModal = async (updatedData) => {
        if (!user || !portfolio) return;
        try {
            const resp = await portfolioService.updatePortfolio(user.sessionId, portfolio._id, updatedData);
            if (resp.success && resp.portfolio) {
                setPortfolio(resp.portfolio);
                setIsEditing(false);
            }
        } catch (e) {
            console.error('Failed to save edits', e);
            throw e;
        }
    };

    const handleSaveAndDashboard = async () => {
        if (!user || !portfolio) return;
        setIsUpdating(true);
        try {
            // If there are unsaved edits, save them first
            if (isEditing && editData) {
                await handleSaveEditModal(editData);
            }
            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const [deployedLink, setDeployedLink] = useState(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);

    const handleDeploy = async () => {
        if (!user || !portfolio) return;
        setIsDeploying(true);
        try {
            // First, ensure portfolio is published
            if (!isPublished) {
                const response = await portfolioService.togglePublish(user.sessionId, portfolio._id, true);
                if (response.success) {
                    setIsPublished(true);
                }
            }
            // Generate public link using urlSlug
            const slug = portfolio.urlSlug || portfolio._id;
            const publicLink = `${window.location.origin}/p/${slug}`;
            setDeployedLink(publicLink);
            setShowDeployModal(true);
        } catch (error) {
            console.error('Failed to deploy:', error);
            alert('Failed to deploy portfolio. Please try again.');
        } finally {
            setIsDeploying(false);
        }
    };

    const copyDeployLink = () => {
        if (deployedLink) {
            navigator.clipboard.writeText(deployedLink);
            alert('Link copied to clipboard!');
        }
    };

    const handleCancelEdit = () => {
        // Reset edits to current portfolio values
        if (portfolio) {
            setEditData({
                header: {
                    name: portfolio.header?.name || '',
                    shortAbout: portfolio.header?.shortAbout || '',
                    location: portfolio.header?.location || '',
                    contacts: {
                        website: portfolio.header?.contacts?.website || '',
                        email: portfolio.header?.contacts?.email || '',
                        phone: portfolio.header?.contacts?.phone || '',
                        twitter: portfolio.header?.contacts?.twitter || '',
                        linkedin: portfolio.header?.contacts?.linkedin || '',
                        github: portfolio.header?.contacts?.github || ''
                    },
                    skills: Array.isArray(portfolio.header?.skills) ? portfolio.header.skills : []
                },
                summary: portfolio.summary || ''
            });
        }
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        if (!user || !portfolio) return;
        setSaving(true);
        try {
            const payload = {
                header: {
                    ...(portfolio.header || {}),
                    name: editData.header.name,
                    shortAbout: editData.header.shortAbout,
                    location: editData.header.location,
                    contacts: { ...(portfolio.header?.contacts || {}), ...editData.header.contacts },
                    skills: Array.isArray(editData.header.skills) ? editData.header.skills : []
                },
                summary: editData.summary,
                workExperience: Array.isArray(editData.workExperience) ? editData.workExperience : [],
                education: Array.isArray(editData.education) ? editData.education : [],
                extraSections: Array.isArray(editData.extraSections) ? editData.extraSections : []
            };
            const resp = await portfolioService.updatePortfolio(user.sessionId, portfolio._id, payload);
            if (resp.success && resp.portfolio) {
                setPortfolio(resp.portfolio);
                setIsEditing(false);
            }
        } catch (e) {
            console.error('Failed to save edits', e);
        } finally {
            setSaving(false);
        }
    };

    // Helpers to update arrays
    const updateWorkField = (index, key, value) => {
        setEditData(prev => {
            const list = [...(prev.workExperience || [])];
            list[index] = { ...(list[index] || {}), [key]: value };
            return { ...prev, workExperience: list };
        });
    };

    const addWorkItem = () => {
        setEditData(prev => ({
            ...prev,
            workExperience: [...(prev.workExperience || []), { company: '', link: '', location: '', contract: '', title: '', start: '', end: '', description: '' }]
        }));
    };

    const removeWorkItem = (index) => {
        setEditData(prev => ({
            ...prev,
            workExperience: (prev.workExperience || []).filter((_, i) => i !== index)
        }));
    };

    const updateEduField = (index, key, value) => {
        setEditData(prev => {
            const list = [...(prev.education || [])];
            list[index] = { ...(list[index] || {}), [key]: value };
            return { ...prev, education: list };
        });
    };

    const addEduItem = () => {
        setEditData(prev => ({
            ...prev,
            education: [...(prev.education || []), { school: '', degree: '', start: '', end: '' }]
        }));
    };

    const removeEduItem = (index) => {
        setEditData(prev => ({
            ...prev,
            education: (prev.education || []).filter((_, i) => i !== index)
        }));
    };

    const updateExtraSectionTitle = (sIdx, title) => {
        setEditData(prev => {
            const sections = [...(prev.extraSections || [])];
            sections[sIdx] = { ...(sections[sIdx] || {}), title };
            return { ...prev, extraSections: sections };
        });
    };

    const addExtraSection = () => {
        setEditData(prev => ({
            ...prev,
            extraSections: [...(prev.extraSections || []), { key: `custom-${Date.now()}`, title: 'New Section', items: [] }]
        }));
    };

    const removeExtraSection = (sIdx) => {
        setEditData(prev => ({
            ...prev,
            extraSections: (prev.extraSections || []).filter((_, i) => i !== sIdx)
        }));
    };

    const addExtraItem = (sIdx) => {
        setEditData(prev => {
            const sections = [...(prev.extraSections || [])];
            const items = [...(sections[sIdx]?.items || [])];
            items.push({ title: '', name: '', description: '', link: '', year: '', venue: '', tech: [] });
            sections[sIdx] = { ...(sections[sIdx] || {}), items };
            return { ...prev, extraSections: sections };
        });
    };

    const removeExtraItem = (sIdx, iIdx) => {
        setEditData(prev => {
            const sections = [...(prev.extraSections || [])];
            const items = (sections[sIdx]?.items || []).filter((_, idx) => idx !== iIdx);
            sections[sIdx] = { ...(sections[sIdx] || {}), items };
            return { ...prev, extraSections: sections };
        });
    };

    const updateExtraItemField = (sIdx, iIdx, key, value) => {
        setEditData(prev => {
            const sections = [...(prev.extraSections || [])];
            const items = [...(sections[sIdx]?.items || [])];
            items[iIdx] = { ...(items[iIdx] || {}), [key]: value };
            sections[sIdx] = { ...(sections[sIdx] || {}), items };
            return { ...prev, extraSections: sections };
        });
    };

    const handleTogglePublish = async () => {
        if (!portfolio) return;

        setIsUpdating(true);
        try {
            const response = await portfolioService.togglePublish(user.sessionId, portfolio._id, !isPublished);
            if (response.success) {
                setIsPublished(!isPublished);
            }
        } catch (error) {
            console.error('Failed to update publish status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const openPhotoPicker = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handlePhotoSelected = async (e) => {
        if (!portfolio || !user) return;
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingPhoto(true);
        try {
            const response = await portfolioService.uploadPortfolioPhoto(user.sessionId, portfolio._id, file);
            if (response.success && response.photoUrl) {
                setPortfolio({ ...portfolio, header: { ...(portfolio.header || {}), photoUrl: response.photoUrl } });
            }
        } catch (err) {
            console.error('Failed to upload photo:', err);
        } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleApplyCustomization = (customizationData) => {
        console.log('PortfolioDisplay received customization:', customizationData);
        if (customizationData.type === 'template') {
            console.log('Setting template to:', customizationData.value);
            setCustomization(prev => {
                const newState = { ...prev, template: customizationData.value };
                console.log('New customization state:', newState);
                return newState;
            });
        } else if (customizationData.type === 'theme') {
            setCustomization(prev => ({ ...prev, theme: customizationData.value }));
        } else if (customizationData.type === 'color') {
            setCustomization(prev => ({ ...prev, colors: customizationData.value }));
        }
    };

    // Check if auth is still loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading Authentication...</p>
                </div>
            </div>
        );
    }

    // Check authentication for portfolio ID routes
    if (portfolioId && (!user || !user.sessionId)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="h-12 w-12 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-4">Please log in to view this portfolio.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading Portfolio...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="h-12 w-12 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Portfolio</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // No portfolio data
    if (!portfolio) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="h-12 w-12 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h2>
                    <p className="text-gray-600 mb-4">The requested portfolio could not be found.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Theme values
    const themeName = portfolio?.themeKey || 'modern';
    const theme = getThemeColors(themeName, 'light');

    return (
        <div className="min-h-screen" style={{ backgroundColor: customization.colors.bodyBg }}>
            {/* Customization Header - Only show for portfolio ID routes */}
            {portfolioId && <PortfolioCustomizer onApplyCustomization={handleApplyCustomization} />}
            
            {/* Header */}
            <div 
                className={`bg-gradient-to-br ${customization.theme.gradient} text-white shadow-lg`}
                style={{ backgroundColor: customization.colors.headerBg }}
            >
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {portfolio.header?.photoUrl && (
                                <img
                                    src={
                                        portfolio.header.photoUrl.startsWith('http')
                                            ? portfolio.header.photoUrl
                                            : `${API_BASE_URL}${portfolio.header.photoUrl}`
                                    }
                                    alt={portfolio.header?.name || 'Profile'}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow"
                                />
                            )}
                            <div>
                                <h1 
                                    className="text-3xl font-bold" 
                                    style={{ color: customization.colors.heading }}
                                >
                                    {portfolio.header?.name || portfolio.title}
                                </h1>
                                <p 
                                    className="opacity-90 mt-2"
                                    style={{ color: customization.colors.subheading }}
                                >
                                    {portfolio.header?.shortAbout || 'Professional Portfolio'}
                                </p>
                                {portfolio.header?.location && (
                                    <p 
                                        className="opacity-80 mt-1"
                                        style={{ color: customization.colors.paragraph }}
                                    >
                                        📍 {portfolio.header.location}
                                    </p>
                                )}
                            </div>
                        </div>

                        {portfolioId && (
                            <div className="flex items-center gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoSelected}
                                />
                                <button
                                    onClick={openPhotoPicker}
                                    disabled={isUploadingPhoto}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-md ${
                                        isUploadingPhoto 
                                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                    style={{ color: isUploadingPhoto ? '#fff' : customization.colors.heading }}
                                >
                                    {isUploadingPhoto ? 'Uploading...' : (portfolio.header?.photoUrl ? 'Change Photo' : 'Upload Photo')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Portfolio Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div 
                    className={`rounded-lg shadow-sm border template-${customization.template} ${customization.theme.bg}`}
                    style={{ 
                        backgroundColor: customization.colors.bodyBg,
                        borderColor: customization.colors.paragraph + '40'
                    }}
                >
                    {/* Simple inline editor for key fields */}
                    {isEditing && editData && (
                        <div className={`p-6 border-b ${theme.border.light}`}>
                            <h2 className={`text-xl font-semibold mb-4 ${theme.text.primary.light}`}>Edit Basics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                                    <input
                                        value={editData.header.name}
                                        onChange={(e) => setEditData({ ...editData, header: { ...editData.header, name: e.target.value } })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Tagline</label>
                                    <input
                                        value={editData.header.shortAbout}
                                        onChange={(e) => setEditData({ ...editData, header: { ...editData.header, shortAbout: e.target.value } })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Professional tagline"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Location</label>
                                    <input
                                        value={editData.header.location}
                                        onChange={(e) => setEditData({ ...editData, header: { ...editData.header, location: e.target.value } })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="City, Country"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Summary</label>
                                    <textarea
                                        value={editData.summary}
                                        onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                                        className="w-full border rounded px-3 py-2 min-h-[100px]"
                                        placeholder="Professional summary"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Skills (comma separated)</label>
                                    <input
                                        value={(editData.header.skills || []).join(', ')}
                                        onChange={(e) => setEditData({ ...editData, header: { ...editData.header, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="JavaScript, React, Node.js"
                                    />
                                </div>
                            </div>
                            {/* Contacts */}
                            <div className="mt-6">
                                <h3 className={`text-lg font-semibold mb-3 ${theme.text.primary.light}`}>Contacts</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                                        <input className="w-full border rounded px-3 py-2" value={editData.header.contacts.email} onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, email: e.target.value } } })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Phone</label>
                                        <input className="w-full border rounded px-3 py-2" value={editData.header.contacts.phone} onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, phone: e.target.value } } })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Website</label>
                                        <input className="w-full border rounded px-3 py-2" value={editData.header.contacts.website} onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, website: e.target.value } } })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
                                        <input className="w-full border rounded px-3 py-2" value={editData.header.contacts.linkedin} onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, linkedin: e.target.value } } })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">GitHub</label>
                                        <input className="w-full border rounded px-3 py-2" value={editData.header.contacts.github} onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, github: e.target.value } } })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Twitter</label>
                                        <input className="w-full border rounded px-3 py-2" value={editData.header.contacts.twitter} onChange={(e) => setEditData({ ...editData, header: { ...editData.header, contacts: { ...editData.header.contacts, twitter: e.target.value } } })} />
                                    </div>
                                </div>
                            </div>
                            {/* Work Experience */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-lg font-semibold ${theme.text.primary.light}`}>Work Experience</h3>
                                    <button onClick={addWorkItem} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Add Experience</button>
                                </div>
                                <div className="space-y-4">
                                    {(editData.workExperience || []).map((exp, idx) => (
                                        <div key={idx} className="border rounded p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm text-gray-600">Item #{idx + 1}</span>
                                                <button onClick={() => removeWorkItem(idx)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remove</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input className="border rounded px-3 py-2" placeholder="Company" value={exp.company || ''} onChange={(e) => updateWorkField(idx, 'company', e.target.value)} />
                                                <input className="border rounded px-3 py-2" placeholder="Title" value={exp.title || ''} onChange={(e) => updateWorkField(idx, 'title', e.target.value)} />
                                                <input className="border rounded px-3 py-2" placeholder="Location" value={exp.location || ''} onChange={(e) => updateWorkField(idx, 'location', e.target.value)} />
                                                <input className="border rounded px-3 py-2" placeholder="Contract" value={exp.contract || ''} onChange={(e) => updateWorkField(idx, 'contract', e.target.value)} />
                                                <input className="border rounded px-3 py-2" placeholder="Start" value={exp.start || ''} onChange={(e) => updateWorkField(idx, 'start', e.target.value)} />
                                                <input className="border rounded px-3 py-2" placeholder="End" value={exp.end || ''} onChange={(e) => updateWorkField(idx, 'end', e.target.value)} />
                                                <input className="border rounded px-3 py-2 md:col-span-3" placeholder="Company Link" value={exp.link || ''} onChange={(e) => updateWorkField(idx, 'link', e.target.value)} />
                                                <textarea className="border rounded px-3 py-2 md:col-span-3" placeholder="Description" value={exp.description || ''} onChange={(e) => updateWorkField(idx, 'description', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Education */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-lg font-semibold ${theme.text.primary.light}`}>Education</h3>
                                    <button onClick={addEduItem} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Add Education</button>
                                </div>
                                <div className="space-y-4">
                                    {(editData.education || []).map((edu, idx) => (
                                        <div key={idx} className="border rounded p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm text-gray-600">Item #{idx + 1}</span>
                                                <button onClick={() => removeEduItem(idx)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remove</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <input className="border rounded px-3 py-2" placeholder="School" value={edu.school || ''} onChange={(e) => updateEduField(idx, 'school', e.target.value)} />
                                                <input className="border rounded px-3 py-2" placeholder="Degree" value={edu.degree || ''} onChange={(e) => updateEduField(idx, 'degree', e.target.value)} />
                                                <input className="border rounded px-3 py-2" placeholder="Start" value={edu.start || ''} onChange={(e) => updateEduField(idx, 'start', e.target.value)} />
                                                <input className="border rounded px-3 py-2" placeholder="End" value={edu.end || ''} onChange={(e) => updateEduField(idx, 'end', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Extra Sections */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-lg font-semibold ${theme.text.primary.light}`}>Extra Sections</h3>
                                    <button onClick={addExtraSection} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Add Section</button>
                                </div>
                                <div className="space-y-6">
                                    {(editData.extraSections || []).map((section, sIdx) => (
                                        <div key={sIdx} className="border rounded p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex-1 mr-3">
                                                    <input className="w-full border rounded px-3 py-2" placeholder="Section Title" value={section.title || ''} onChange={(e) => updateExtraSectionTitle(sIdx, e.target.value)} />
                                                </div>
                                                <button onClick={() => removeExtraSection(sIdx)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remove Section</button>
                                            </div>
                                            <div className="space-y-3">
                                                {(section.items || []).map((item, iIdx) => (
                                                    <div key={iIdx} className="border rounded p-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs text-gray-600">Item #{iIdx + 1}</span>
                                                            <button onClick={() => removeExtraItem(sIdx, iIdx)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Remove</button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                            <input className="border rounded px-3 py-2" placeholder="Title" value={item.title || ''} onChange={(e) => updateExtraItemField(sIdx, iIdx, 'title', e.target.value)} />
                                                            <input className="border rounded px-3 py-2" placeholder="Name" value={item.name || ''} onChange={(e) => updateExtraItemField(sIdx, iIdx, 'name', e.target.value)} />
                                                            <input className="border rounded px-3 py-2" placeholder="Link" value={item.link || ''} onChange={(e) => updateExtraItemField(sIdx, iIdx, 'link', e.target.value)} />
                                                            <input className="border rounded px-3 py-2" placeholder="Venue" value={item.venue || ''} onChange={(e) => updateExtraItemField(sIdx, iIdx, 'venue', e.target.value)} />
                                                            <input className="border rounded px-3 py-2" placeholder="Year" value={item.year || ''} onChange={(e) => updateExtraItemField(sIdx, iIdx, 'year', e.target.value)} />
                                                            <input className="border rounded px-3 py-2 md:col-span-3" placeholder="Tech (comma separated)" value={Array.isArray(item.tech) ? item.tech.join(', ') : ''} onChange={(e) => updateExtraItemField(sIdx, iIdx, 'tech', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} />
                                                            <textarea className="border rounded px-3 py-2 md:col-span-3" placeholder="Description" value={item.description || ''} onChange={(e) => updateExtraItemField(sIdx, iIdx, 'description', e.target.value)} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3">
                                                <button onClick={() => addExtraItem(sIdx)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Add Item</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Contact Information */}
                    {portfolio.header?.contacts && (
                        <div className="p-6 border-b" style={{ borderColor: customization.colors.paragraph + '20' }}>
                            <h2 
                                className="text-xl font-semibold mb-4" 
                                style={{ color: customization.colors.heading }}
                            >
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {portfolio.header.contacts.email && (
                                    <div className="flex items-center gap-3">
                                        <FaEnvelope className="text-gray-400" />
                                        <span style={{ color: customization.colors.paragraph }}>{portfolio.header.contacts.email}</span>
                                    </div>
                                )}
                                {portfolio.header.contacts.phone && (
                                    <div className="flex items-center gap-3">
                                        <FaPhone className="text-gray-400" />
                                        <span style={{ color: customization.colors.paragraph }}>{portfolio.header.contacts.phone}</span>
                                    </div>
                                )}
                                {portfolio.header.location && (
                                    <div className="flex items-center gap-3">
                                        <FaGlobe className="text-gray-400" />
                                        <span className={`${theme.text.primary.light}`}>{portfolio.header.location}</span>
                                    </div>
                                )}
                                {portfolio.header.contacts.website && (
                                    <div className="flex items-center gap-3">
                                        <FaGlobe className="text-gray-400" />
                                        <a href={portfolio.header.contacts.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                            {portfolio.header.contacts.website}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-4 mt-4">
                                {portfolio.header.contacts.linkedin && (
                                    <a href={`https://linkedin.com/in/${portfolio.header.contacts.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                        <FaLinkedin className="w-5 h-5" />
                                    </a>
                                )}
                                {portfolio.header.contacts.github && (
                                    <a href={`https://github.com/${portfolio.header.contacts.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                                        <FaGithub className="w-5 h-5" />
                                    </a>
                                )}
                                {portfolio.header.contacts.twitter && (
                                    <a href={`https://twitter.com/${portfolio.header.contacts.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                                        <FaTwitter className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    {portfolio.summary && (
                        <div className="p-6 border-b" style={{ borderColor: customization.colors.paragraph + '20' }}>
                            <h2 className="text-xl font-semibold mb-4" style={{ color: customization.colors.heading }}>About</h2>
                            <p className="leading-relaxed" style={{ color: customization.colors.paragraph }}>{portfolio.summary}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {portfolio.header?.skills && portfolio.header.skills.length > 0 && (
                        <div className="p-6 border-b" style={{ borderColor: customization.colors.paragraph + '20' }}>
                            <h2 className="text-xl font-semibold mb-4" style={{ color: customization.colors.heading }}>Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {portfolio.header.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${theme.gradients.skills}`}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Work Experience */}
                    {portfolio.workExperience && portfolio.workExperience.length > 0 && (
                        <div className="p-6 border-b" style={{ borderColor: customization.colors.paragraph + '20' }}>
                            <h2 className="text-xl font-semibold mb-4" style={{ color: customization.colors.heading }}>Work Experience</h2>
                            <div className="space-y-6">
                                {portfolio.workExperience.map((exp, index) => (
                                    <div key={index} className="border-l-4 pl-4" style={{ borderLeftColor: customization.colors.subheading }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold" style={{ color: customization.colors.subheading }}>{exp.title}</h3>
                                                <p className="font-medium" style={{ color: customization.colors.paragraph }}>{exp.company}</p>
                                                {exp.location && (
                                                    <p className="text-sm" style={{ color: customization.colors.paragraph }}>{exp.location}</p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm" style={{ color: customization.colors.paragraph }}>
                                                <p>{exp.start} - {exp.end}</p>
                                                {exp.contract && (
                                                    <p className="text-xs opacity-80">{exp.contract}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="leading-relaxed" style={{ color: customization.colors.paragraph }}>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {portfolio.education && portfolio.education.length > 0 && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4" style={{ color: customization.colors.heading }}>Education</h2>
                            <div className="space-y-4">
                                {portfolio.education.map((edu, index) => (
                                    <div key={index} className="border-l-4 pl-4" style={{ borderLeftColor: customization.colors.subheading }}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold" style={{ color: customization.colors.subheading }}>{edu.degree}</h3>
                                                <p className="font-medium" style={{ color: customization.colors.paragraph }}>{edu.school}</p>
                                            </div>
                                            <div className="text-right text-sm" style={{ color: customization.colors.paragraph }}>
                                                <p>{edu.start} - {edu.end}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dynamic Extra Sections */}
                    {Array.isArray(portfolio.extraSections) && portfolio.extraSections.length > 0 && (
                        <div className="p-6 border-t" style={{ borderColor: customization.colors.paragraph + '20' }}>
                            {portfolio.extraSections.map((section, sIdx) => (
                                (section?.items?.length > 0) ? (
                                    <div key={sIdx} className="mb-8">
                                        <h2 className="text-xl font-semibold mb-4" style={{ color: customization.colors.heading }}>{section.title || section.key}</h2>
                                        <div className="space-y-4">
                                            {section.items.map((item, iIdx) => (
                                                <div key={iIdx} className="border rounded-md p-4" style={{ borderColor: customization.colors.paragraph + '30' }}>
                                                    {/* Generic renderer: print common fields nicely */}
                                                    {item.title && <p className="font-medium" style={{ color: customization.colors.subheading }}>{item.title}</p>}
                                                    {item.name && <p className="font-medium" style={{ color: customization.colors.subheading }}>{item.name}</p>}
                                                    {item.venue && <p className="text-sm" style={{ color: customization.colors.paragraph }}>{item.venue} {item.year ? `• ${item.year}` : ''}</p>}
                                                    {item.client && <p className="text-sm" style={{ color: customization.colors.paragraph }}>Client: {item.client}</p>}
                                                    {item.description && <p className="mt-1" style={{ color: customization.colors.paragraph }}>{item.description}</p>}
                                                    {Array.isArray(item.tech) && item.tech.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {item.tech.map((t, tIdx) => (
                                                                <span key={tIdx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{t}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.link && (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm">View</a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {portfolioId && (
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={handleStartEdit}
                            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3 text-lg font-semibold shadow-lg"
                        >
                            <FaEdit className="text-xl" />
                            Edit Portfolio
                        </button>
                        <button
                            onClick={handleSaveAndDashboard}
                            disabled={isUpdating}
                            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaDownload className="text-xl" />
                            {isUpdating ? 'Saving...' : 'Save & Dashboard'}
                        </button>
                        <button
                            onClick={handleDeploy}
                            disabled={isDeploying}
                            className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-3 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaShare className="text-xl" />
                            {isDeploying ? 'Deploying...' : 'Deploy'}
                        </button>
                    </div>
                )}
            </div>

            {/* Portfolio Edit Modal */}
            <PortfolioEditModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                portfolio={portfolio}
                onSave={handleSaveEditModal}
            />

            {/* Deploy Success Modal */}
            {showDeployModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
                        <div className="text-center">
                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <FaShare className="text-4xl text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Portfolio Deployed Successfully!</h2>
                            <p className="text-gray-600 mb-6">Your portfolio is now live and accessible from anywhere.</p>
                            
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Your Portable Link:</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={deployedLink}
                                        readOnly
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-800 font-mono text-sm"
                                    />
                                    <button
                                        onClick={copyDeployLink}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
                                    >
                                        <FaCopy />
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => window.open(deployedLink, '_blank')}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
                                >
                                    <FaEye />
                                    View Live
                                </button>
                                <button
                                    onClick={() => setShowDeployModal(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioDisplay;
