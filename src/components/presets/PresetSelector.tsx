import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { ALL_PRESETS } from '../../lib/presets/presetUtils';
import { PhotoPreset, DocumentType } from '../../types';
import { Check, ShieldCheck, Info, ExternalLink, ArrowRight, Search, Plus, X, Globe, Sparkles } from 'lucide-react';
import { calculateAutoCrop } from '../../lib/face/measureHead';

export const PresetSelector: React.FC = () => {
  const {
    activePreset,
    setActivePreset,
    setStep,
    imageDimensions,
    faceResult,
    setCroppedAreaPixels,
    customPresets,
    addCustomPreset,
  } = useEditorStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'passport' | 'visa' | 'custom'>('all');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Custom preset form state
  const [customName, setCustomName] = useState('My Custom Photo Spec');
  const [customCountry, setCustomCountry] = useState('Custom Region');
  const [customWidthMm, setCustomWidthMm] = useState(35);
  const [customHeightMm, setCustomHeightMm] = useState(45);
  const [customHeadMin, setCustomHeadMin] = useState(70);
  const [customHeadMax, setCustomHeadMax] = useState(80);

  const combinedPresets = [...ALL_PRESETS, ...customPresets];

  const handleSelectPreset = (preset: PhotoPreset) => {
    setActivePreset(preset);

    // Recalculate auto-crop box for new preset
    if (imageDimensions && faceResult) {
      const autoCrop = calculateAutoCrop(
        imageDimensions.width,
        imageDimensions.height,
        faceResult,
        preset
      );
      setCroppedAreaPixels(autoCrop);
    }
  };

  const handleCreateCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const newPreset: PhotoPreset = {
      id: `custom_${Date.now()}`,
      name: customName || 'Custom Spec',
      country: customCountry || 'Custom',
      countryCode: 'CUSTOM',
      docType: 'custom',
      widthMm: Number(customWidthMm),
      heightMm: Number(customHeightMm),
      aspectRatio: Number(customWidthMm) / Number(customHeightMm),
      headHeightMinRatio: Number(customHeadMin) / 100,
      headHeightMaxRatio: Number(customHeadMax) / 100,
      eyeLineMinRatio: 0.55,
      eyeLineMaxRatio: 0.68,
      backgroundColor: 'white',
      bgHex: '#FFFFFF',
      notes: `Custom specification (${customWidthMm}x${customHeightMm} mm), Head coverage ${customHeadMin}-${customHeadMax}%.`,
      lastUpdated: new Date().toISOString().split('T')[0],
      isCustom: true,
    };

    addCustomPreset(newPreset);
    handleSelectPreset(newPreset);
    setIsCustomModalOpen(false);
  };

  const filteredPresets = combinedPresets.filter((preset) => {
    const matchesSearch =
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.notes.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'passport') return preset.docType === 'passport';
    if (selectedCategory === 'visa') return preset.docType === 'visa' || preset.docType === 'oci' || preset.docType === 'id_card';
    if (selectedCategory === 'custom') return preset.docType === 'custom' || preset.isCustom;

    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Country & Document Specification
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Select Passport / ID Standard</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official government parameters for photo dimensions, head height ratios, and background colors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Create Custom Spec
          </button>

          <button
            onClick={() => setStep('editor')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
          >
            Continue to Editor <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning Callout */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Important Compliance Reminder: </span>
          Specifications update periodically (e.g. India updated passport photos to 35x45mm in Sept 2025). Always verify rules with official government issuing authorities.
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search country or spec (e.g. India, US, UK)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Specs ({combinedPresets.length})
          </button>
          <button
            onClick={() => setSelectedCategory('passport')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'passport' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Passports
          </button>
          <button
            onClick={() => setSelectedCategory('visa')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'visa' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visas & OCI
          </button>
          <button
            onClick={() => setSelectedCategory('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'custom' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom ({customPresets.length + 1})
          </button>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => {
          const isSelected = activePreset.id === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`relative cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-emerald-400" /> {preset.country}
                      </span>
                      {preset.isCustom && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Custom
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-white text-base mt-2">{preset.name}</h3>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-emerald-400 text-slate-950' : 'border border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Dimension Badges */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Photo Size</span>
                    <span className="font-bold text-white">{preset.widthMm} x {preset.heightMm} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Head Coverage</span>
                    <span className="font-bold text-emerald-400">
                      {(preset.headHeightMinRatio * 100).toFixed(0)} - {(preset.headHeightMaxRatio * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">{preset.notes}</p>
              </div>

              {preset.officialSourceUrl && (
                <a
                  href={preset.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
                >
                  <ExternalLink className="w-3 h-3" /> Official Government Guidelines
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Specification Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Create Custom Photo Specification
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomPreset} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Preset Title</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Country / Institution</label>
                <input
                  type="text"
                  required
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Width (mm)</label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="100"
                    value={customWidthMm}
                    onChange={(e) => setCustomWidthMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Height (mm)</label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="100"
                    value={customHeightMm}
                    onChange={(e) => setCustomHeightMm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Head Coverage Min %</label>
                  <input
                    type="number"
                    required
                    min="30"
                    max="90"
                    value={customHeadMin}
                    onChange={(e) => setCustomHeadMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Head Coverage Max %</label>
                  <input
                    type="number"
                    required
                    min="40"
                    max="95"
                    value={customHeadMax}
                    onChange={(e) => setCustomHeadMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
