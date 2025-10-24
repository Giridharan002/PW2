import React, { useState } from 'react';
import { FaPalette, FaLayerGroup, FaMagic, FaTimes } from 'react-icons/fa';

const PortfolioCustomizer = ({ onApplyCustomization }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [selectedTheme, setSelectedTheme] = useState('Ocean Blue');
  const [colors, setColors] = useState({
    heading: '#000000',
    subheading: '#333333',
    paragraph: '#555555',
    headerBg: '#ffffff',
    bodyBg: '#f9f9f9',
  });

  // Template color schemes - each template has its own color palette
  const templateColorSchemes = {
    'modern-clean': {
      heading: '#1e40af',
      subheading: '#3b82f6',
      paragraph: '#64748b',
      headerBg: '#eff6ff',
      bodyBg: '#ffffff',
    },
    'modern-gradient': {
      heading: '#6366f1',
      subheading: '#8b5cf6',
      paragraph: '#475569',
      headerBg: '#eef2ff',
      bodyBg: '#f8fafc',
    },
    'simple-minimal': {
      heading: '#1f2937',
      subheading: '#4b5563',
      paragraph: '#6b7280',
      headerBg: '#f9fafb',
      bodyBg: '#ffffff',
    },
    'simple-classic': {
      heading: '#78350f',
      subheading: '#92400e',
      paragraph: '#44403c',
      headerBg: '#fef3c7',
      bodyBg: '#fffbeb',
    },
    'innovative-tech': {
      heading: '#10b981',
      subheading: '#34d399',
      paragraph: '#6ee7b7',
      headerBg: '#000000',
      bodyBg: '#0a0a0a',
    },
    'innovative-creative': {
      heading: '#ec4899',
      subheading: '#a855f7',
      paragraph: '#8b5cf6',
      headerBg: '#fdf2f8',
      bodyBg: '#faf5ff',
    },
    'classic-formal': {
      heading: '#1f2937',
      subheading: '#374151',
      paragraph: '#4b5563',
      headerBg: '#f3f4f6',
      bodyBg: '#ffffff',
    },
    'classic-traditional': {
      heading: '#422006',
      subheading: '#78350f',
      paragraph: '#57534e',
      headerBg: '#fef3c7',
      bodyBg: '#fffbeb',
    },
    'elegant-luxury': {
      heading: '#ca8a04',
      subheading: '#eab308',
      paragraph: '#78716c',
      headerBg: '#fef9c3',
      bodyBg: '#fffbeb',
    },
    'elegant-sophisticated': {
      heading: '#000000',
      subheading: '#1f2937',
      paragraph: '#4b5563',
      headerBg: '#f3f4f6',
      bodyBg: '#e5e7eb',
    },
    'creative-bold': {
      heading: '#fbbf24',
      subheading: '#fcd34d',
      paragraph: '#ffffff',
      headerBg: '#dc2626',
      bodyBg: '#ef4444',
    },
    'creative-artistic': {
      heading: '#ec4899',
      subheading: '#f472b6',
      paragraph: '#a855f7',
      headerBg: '#fdf2f8',
      bodyBg: '#faf5ff',
    },
    'bold-vibrant': {
      heading: '#000000',
      subheading: '#1f2937',
      paragraph: '#0f172a',
      headerBg: '#fbbf24',
      bodyBg: '#fef3c7',
    },
    'bold-striking': {
      heading: '#ffffff',
      subheading: '#f3f4f6',
      paragraph: '#e5e7eb',
      headerBg: '#7c3aed',
      bodyBg: '#a855f7',
    },
    'minimal-zen': {
      heading: '#6b7280',
      subheading: '#9ca3af',
      paragraph: '#d1d5db',
      headerBg: '#fafafa',
      bodyBg: '#ffffff',
    },
    'minimal-nordic': {
      heading: '#3b82f6',
      subheading: '#60a5fa',
      paragraph: '#475569',
      headerBg: '#f8fafc',
      bodyBg: '#ffffff',
    },
    'professional-corporate': {
      heading: '#1e3a8a',
      subheading: '#1e40af',
      paragraph: '#475569',
      headerBg: '#eff6ff',
      bodyBg: '#ffffff',
    },
    'professional-executive': {
      heading: '#1f2937',
      subheading: '#374151',
      paragraph: '#6b7280',
      headerBg: '#f3f4f6',
      bodyBg: '#f9fafb',
    },
  };

  const templates = {
    Modern: [
      { id: 'modern-clean', name: 'Modern Clean', preview: 'clean' },
      { id: 'modern-gradient', name: 'Modern Gradient', preview: 'gradient' }
    ],
    Simple: [
      { id: 'simple-minimal', name: 'Simple Minimal', preview: 'minimal' },
      { id: 'simple-classic', name: 'Simple Classic', preview: 'classic' }
    ],
    Innovative: [
      { id: 'innovative-tech', name: 'Innovative Tech', preview: 'tech' },
      { id: 'innovative-creative', name: 'Innovative Creative', preview: 'creative' }
    ],
    Classic: [
      { id: 'classic-formal', name: 'Classic Formal', preview: 'formal' },
      { id: 'classic-traditional', name: 'Classic Traditional', preview: 'traditional' }
    ],
    Elegant: [
      { id: 'elegant-luxury', name: 'Elegant Luxury', preview: 'luxury' },
      { id: 'elegant-sophisticated', name: 'Elegant Sophisticated', preview: 'sophisticated' }
    ],
    Creative: [
      { id: 'creative-bold', name: 'Creative Bold', preview: 'cbold' },
      { id: 'creative-artistic', name: 'Creative Artistic', preview: 'artistic' }
    ],
    Bold: [
      { id: 'bold-vibrant', name: 'Bold Vibrant', preview: 'vibrant' },
      { id: 'bold-striking', name: 'Bold Striking', preview: 'striking' }
    ],
    Minimal: [
      { id: 'minimal-zen', name: 'Minimal Zen', preview: 'zen' },
      { id: 'minimal-nordic', name: 'Minimal Nordic', preview: 'nordic' }
    ],
    Professional: [
      { id: 'professional-corporate', name: 'Professional Corporate', preview: 'corporate' },
      { id: 'professional-executive', name: 'Professional Executive', preview: 'executive' }
    ],
  };

  const themes = [
    { name: 'Ocean Blue', gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50' },
    { name: 'Sunset Orange', gradient: 'from-orange-500 to-pink-400', bg: 'bg-orange-50' },
    { name: 'Forest Green', gradient: 'from-green-600 to-teal-400', bg: 'bg-green-50' },
    { name: 'Royal Purple', gradient: 'from-purple-600 to-pink-500', bg: 'bg-purple-50' },
    { name: 'Midnight Black', gradient: 'from-gray-900 to-gray-700', bg: 'bg-gray-100' },
    { name: 'Soft Beige', gradient: 'from-amber-200 to-orange-200', bg: 'bg-amber-50' },
    { name: 'Gradient Glow', gradient: 'from-indigo-500 via-purple-500 to-pink-500', bg: 'bg-indigo-50' },
    { name: 'Pastel Dream', gradient: 'from-pink-300 to-purple-300', bg: 'bg-pink-50' },
    { name: 'Neon Pulse', gradient: 'from-lime-400 to-cyan-400', bg: 'bg-lime-50' },
  ];

  const closeModal = () => {
    setActiveSection(null);
    setColorSection(null);
  };

  const applyTemplate = (template) => {
    console.log('Applying template:', template);
    setSelectedTemplate(template);
    
    // Get the color scheme for this template
    const templateColors = templateColorSchemes[template];
    if (templateColors) {
      console.log('Applying template colors:', templateColors);
      setColors(templateColors);
      // Apply both template and colors
      onApplyCustomization({ type: 'template', value: template });
      onApplyCustomization({ type: 'color', value: templateColors });
    } else {
      // Just apply template without colors
      onApplyCustomization({ type: 'template', value: template });
    }
    
    closeModal();
  };

  const applyTheme = (theme) => {
    setSelectedTheme(theme.name);
    onApplyCustomization({ type: 'theme', value: theme });
    closeModal();
  };

  const applyColor = (colorType, value) => {
    const newColors = { ...colors, [colorType]: value };
    setColors(newColors);
    onApplyCustomization({ type: 'color', colorType, value: newColors });
  };

  const [colorSection, setColorSection] = useState(null); // 'word', 'header', 'body'

  // Render unique preview for each template
  const renderTemplatePreview = (previewType) => {
    const previews = {
      clean: (
        <div className="aspect-video bg-white border rounded p-2 relative overflow-hidden">
          <div className="h-2 bg-blue-500 rounded mb-2"></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-300 rounded w-4/5"></div>
            <div className="h-1 bg-gray-200 rounded w-3/5"></div>
            <div className="h-1 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ),
      gradient: (
        <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 border rounded p-2 relative overflow-hidden">
          <div className="h-2 bg-white/80 rounded mb-2"></div>
          <div className="space-y-1">
            <div className="h-1 bg-white/60 rounded w-4/5"></div>
            <div className="h-1 bg-white/40 rounded w-3/5"></div>
          </div>
        </div>
      ),
      minimal: (
        <div className="aspect-video bg-gray-50 border rounded p-3 relative overflow-hidden">
          <div className="h-1 bg-gray-400 rounded w-1/2 mb-3"></div>
          <div className="space-y-2">
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      ),
      classic: (
        <div className="aspect-video bg-amber-50 border-2 border-amber-800 rounded p-2">
          <div className="h-2 bg-amber-800 rounded w-2/3 mb-2"></div>
          <div className="space-y-1">
            <div className="h-1 bg-amber-700 rounded w-full"></div>
            <div className="h-1 bg-amber-600 rounded w-4/5"></div>
          </div>
        </div>
      ),
      tech: (
        <div className="aspect-video bg-black border-2 border-green-500 rounded p-2">
          <div className="h-2 bg-green-500 rounded mb-2 font-mono"></div>
          <div className="space-y-1">
            <div className="h-1 bg-green-400 rounded w-3/4"></div>
            <div className="h-1 bg-green-300 rounded w-1/2"></div>
            <div className="absolute bottom-2 right-2 text-green-500 text-xs">&gt;_</div>
          </div>
        </div>
      ),
      creative: (
        <div className="aspect-video bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 border rounded-2xl p-2 shadow-lg">
          <div className="h-2 bg-white/70 rounded-full mb-2"></div>
          <div className="space-y-1">
            <div className="h-1 bg-white/60 rounded-full w-4/5"></div>
            <div className="h-1 bg-white/50 rounded-full w-3/5"></div>
          </div>
        </div>
      ),
      formal: (
        <div className="aspect-video bg-white border-4 border-gray-800 rounded p-3">
          <div className="h-2 bg-gray-800 w-1/2 mb-2"></div>
          <div className="space-y-1.5">
            <div className="h-1 bg-gray-600 w-full"></div>
            <div className="h-1 bg-gray-500 w-4/5"></div>
            <div className="h-1 bg-gray-400 w-3/4"></div>
          </div>
        </div>
      ),
      traditional: (
        <div className="aspect-video bg-cream border-4 border-double border-brown-800 rounded p-2">
          <div className="border-b-2 border-gray-700 pb-1 mb-2">
            <div className="h-2 bg-gray-800 w-2/3"></div>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-700 w-full"></div>
            <div className="h-1 bg-gray-600 w-4/5"></div>
          </div>
        </div>
      ),
      luxury: (
        <div className="aspect-video bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-600 rounded p-3 shadow-xl">
          <div className="h-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded mb-2"></div>
          <div className="space-y-1">
            <div className="h-1 bg-amber-700 rounded w-4/5"></div>
            <div className="h-1 bg-amber-600 rounded w-3/5"></div>
          </div>
        </div>
      ),
      sophisticated: (
        <div className="aspect-video bg-gray-100 border-t-4 border-b-4 border-black p-2">
          <div className="text-center">
            <div className="h-2 bg-black w-1/2 mx-auto mb-2"></div>
            <div className="space-y-1">
              <div className="h-1 bg-gray-700 w-4/5 mx-auto"></div>
              <div className="h-1 bg-gray-600 w-3/5 mx-auto"></div>
            </div>
          </div>
        </div>
      ),
      cbold: (
        <div className="aspect-video bg-red-500 border-4 border-black rounded p-2 transform rotate-1">
          <div className="h-3 bg-yellow-400 rounded w-3/4 mb-2 font-black"></div>
          <div className="space-y-1">
            <div className="h-1.5 bg-white rounded w-full"></div>
            <div className="h-1.5 bg-white rounded w-4/5"></div>
          </div>
        </div>
      ),
      artistic: (
        <div className="aspect-video bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 rounded-3xl p-2 shadow-2xl">
          <div className="h-2 bg-white/80 rounded-full w-2/3 mb-2"></div>
          <div className="space-y-1">
            <div className="h-1 bg-white/70 rounded-full w-full"></div>
            <div className="h-1 bg-white/60 rounded-full w-4/5"></div>
          </div>
          <div className="absolute bottom-2 right-2 flex gap-1">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      ),
      vibrant: (
        <div className="aspect-video bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 border-8 border-black rounded p-2">
          <div className="h-3 bg-black rounded w-3/4 mb-2"></div>
          <div className="space-y-1">
            <div className="h-1.5 bg-black/80 rounded w-full"></div>
            <div className="h-1.5 bg-black/70 rounded w-4/5"></div>
          </div>
        </div>
      ),
      striking: (
        <div className="aspect-video bg-gradient-to-tr from-purple-600 via-pink-600 to-red-600 rounded-lg p-2 shadow-2xl">
          <div className="h-3 bg-white rounded w-2/3 mb-2"></div>
          <div className="space-y-1">
            <div className="h-1.5 bg-white/90 rounded w-full"></div>
            <div className="h-1.5 bg-white/80 rounded w-4/5"></div>
            <div className="h-1.5 bg-white/70 rounded w-3/4"></div>
          </div>
        </div>
      ),
      zen: (
        <div className="aspect-video bg-gray-50 border border-gray-300 rounded p-4">
          <div className="h-1 bg-gray-400 w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-0.5 bg-gray-300 w-full"></div>
            <div className="h-0.5 bg-gray-300 w-4/5"></div>
          </div>
        </div>
      ),
      nordic: (
        <div className="aspect-video bg-white border-2 border-gray-200 rounded p-3">
          <div className="h-1.5 bg-blue-400 w-1/2 mb-3"></div>
          <div className="space-y-2">
            <div className="h-1 bg-gray-300 w-full"></div>
            <div className="h-1 bg-gray-300 w-4/5"></div>
            <div className="h-1 bg-gray-300 w-3/5"></div>
          </div>
        </div>
      ),
      corporate: (
        <div className="aspect-video bg-white border-l-8 border-blue-900 rounded p-2 shadow-md">
          <div className="h-2 bg-blue-900 w-2/3 mb-2"></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-600 w-full"></div>
            <div className="h-1 bg-gray-500 w-4/5"></div>
            <div className="h-1 bg-gray-400 w-3/5"></div>
          </div>
        </div>
      ),
      executive: (
        <div className="aspect-video bg-gradient-to-b from-gray-100 to-white border border-gray-300 rounded-lg p-2 shadow-lg">
          <div className="h-2.5 bg-gray-800 w-1/2 mb-2"></div>
          <div className="space-y-1.5">
            <div className="h-1 bg-gray-600 w-full"></div>
            <div className="h-1 bg-gray-500 w-4/5"></div>
          </div>
          <div className="absolute bottom-2 right-2 w-8 h-1 bg-blue-600"></div>
        </div>
      ),
    };
    return previews[previewType] || previews.clean;
  };

  const surpriseMe = () => {
    const allTemplates = Object.values(templates).flat();
    const randomTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomColors = {
      heading: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      subheading: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      paragraph: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      headerBg: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      bodyBg: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    };
    
    setSelectedTemplate(randomTemplate.id);
    setSelectedTheme(randomTheme.name);
    setColors(randomColors);
    
    onApplyCustomization({ type: 'template', value: randomTemplate.id });
    onApplyCustomization({ type: 'theme', value: randomTheme });
    onApplyCustomization({ type: 'color', value: randomColors });
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveSection('template')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FaLayerGroup />
            Template
          </button>
          <button
            onClick={() => setActiveSection('theme')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FaPalette />
            Theme
          </button>
          <button
            onClick={() => setActiveSection('color')}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FaPalette />
            Change Color
          </button>
          <button
            onClick={surpriseMe}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FaMagic />
            Surprise Me
          </button>
        </div>
      </div>

      {/* Template Modal */}
      {activeSection === 'template' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Choose a Template</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6 space-y-8">
              {Object.entries(templates).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">{category}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {items.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template.id)}
                        className={`p-4 border-2 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all ${
                          selectedTemplate === template.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200'
                        }`}
                      >
                        {/* Unique Visual Preview for Each Template */}
                        {renderTemplatePreview(template.preview)}
                        <p className="text-sm font-medium text-gray-700 mt-2">
                          {template.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      {activeSection === 'theme' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Choose a Theme</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className={`p-4 border-2 rounded-lg hover:border-purple-500 transition-all ${
                    selectedTheme === theme.name ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                  }`}
                >
                  <div className={`h-24 bg-gradient-to-r ${theme.gradient} rounded-lg mb-3`}></div>
                  <p className="text-sm font-semibold text-gray-700">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Color Modal - Main Selection */}
      {activeSection === 'color' && !colorSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Change Color</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => setColorSection('word')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Word Color</h3>
                <p className="text-sm text-gray-600">Change Heading, Subheading, Paragraph colors</p>
              </button>
              <button
                onClick={() => setColorSection('header')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Header</h3>
                <p className="text-sm text-gray-600">Change header background color</p>
              </button>
              <button
                onClick={() => setColorSection('body')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Body</h3>
                <p className="text-sm text-gray-600">Change entire portfolio background color</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Modal - Word Colors */}
      {activeSection === 'color' && colorSection === 'word' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <button onClick={() => setColorSection(null)} className="text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-800">Word Colors</h2>
              <button onClick={() => { closeModal(); setColorSection(null); }} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <label className="text-gray-700 font-medium">Heading</label>
                <input
                  type="color"
                  value={colors.heading}
                  onChange={(e) => applyColor('heading', e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <label className="text-gray-700 font-medium">Subheading</label>
                <input
                  type="color"
                  value={colors.subheading}
                  onChange={(e) => applyColor('subheading', e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <label className="text-gray-700 font-medium">Paragraph</label>
                <input
                  type="color"
                  value={colors.paragraph}
                  onChange={(e) => applyColor('paragraph', e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color Modal - Header Background */}
      {activeSection === 'color' && colorSection === 'header' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <button onClick={() => setColorSection(null)} className="text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-800">Header Color</h2>
              <button onClick={() => { closeModal(); setColorSection(null); }} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <label className="text-gray-700 font-medium">Header Background</label>
                <input
                  type="color"
                  value={colors.headerBg}
                  onChange={(e) => applyColor('headerBg', e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color Modal - Body Background */}
      {activeSection === 'color' && colorSection === 'body' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <button onClick={() => setColorSection(null)} className="text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-800">Body Color</h2>
              <button onClick={() => { closeModal(); setColorSection(null); }} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <label className="text-gray-700 font-medium">Body Background</label>
                <input
                  type="color"
                  value={colors.bodyBg}
                  onChange={(e) => applyColor('bodyBg', e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCustomizer;
