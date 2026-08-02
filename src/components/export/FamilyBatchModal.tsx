import React, { useState, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Users, Plus, Trash2, X, Download, Printer, CheckCircle2 } from 'lucide-react';
import { FamilyMemberItem, renderFamilyPrintSheetCanvas } from '../../lib/print/familyComposer';
import { generatePrintSheetPdf, downloadBlob } from '../../lib/print/exportPdf';
import { PrintSheetPreset } from '../../types';

interface FamilyBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilyBatchModal: React.FC<FamilyBatchModalProps> = ({ isOpen, onClose }) => {
  const { activePreset } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [members, setMembers] = useState<FamilyMemberItem[]>([]);
  const [memberNameInput, setMemberNameInput] = useState('Family Member');
  const [memberCopiesInput, setMemberCopiesInput] = useState(2);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const handleAddMember = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const newItem: FamilyMemberItem = {
            id: `member_${Date.now()}`,
            name: memberNameInput || `Member ${members.length + 1}`,
            canvas: canvas,
            copies: memberCopiesInput,
          };

          const updated = [...members, newItem];
          setMembers(updated);
          updateSheetPreview(updated);
        }
      };
    }
  };

  const handleRemoveMember = (id: string) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    updateSheetPreview(updated);
  };

  const defaultSheetPreset: PrintSheetPreset = {
    id: 'family_4x6',
    name: '4x6 Inch Print Sheet (6 photos)',
    paperFormat: '4x6',
    sheetWidthInches: 4,
    sheetHeightInches: 6,
    rows: 3,
    cols: 2,
    marginMm: 5,
    gapMm: 3,
  };

  const updateSheetPreview = (queue: FamilyMemberItem[]) => {
    if (queue.length === 0) {
      setPreviewCanvas(null);
      return;
    }
    const canvas = renderFamilyPrintSheetCanvas(queue, activePreset, defaultSheetPreset, 150);
    setPreviewCanvas(canvas);
  };

  const handleDownloadFamilySheet = async () => {
    if (members.length === 0) return;
    const highResSheetCanvas = renderFamilyPrintSheetCanvas(members, activePreset, defaultSheetPreset, 300);
    const pdfBytes = await generatePrintSheetPdf(highResSheetCanvas, activePreset, defaultSheetPreset);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    downloadBlob(blob, `printmint-family-batch-sheet.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">Family Batch Print Sheet Composer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Mix multiple family members on a single 4x6" print sheet to save printing costs at Walgreens or CVS.
        </p>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Member Name</label>
            <input
              type="text"
              value={memberNameInput}
              onChange={(e) => setMemberNameInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Photo Copies</label>
            <input
              type="number"
              min="1"
              max="6"
              value={memberCopiesInput}
              onChange={(e) => setMemberCopiesInput(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAddMember}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> Add Member Photo
            </button>
          </div>
        </div>

        {/* Member Queue & Preview Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Member List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <span className="text-xs font-bold text-slate-300 block">Queue ({members.length} Members)</span>
            {members.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No family members added yet. Click "Add Member Photo" to start.
              </div>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{m.name}</span>
                    <span className="text-[10px] text-emerald-400">{m.copies} copies on sheet</span>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Canvas Sheet Preview */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 mb-2">4x6" Sheet Layout Preview</span>
            {previewCanvas ? (
              <img
                src={previewCanvas.toDataURL('image/png')}
                alt="Family Print Sheet"
                className="max-h-44 object-contain rounded-lg border border-slate-800 shadow-lg"
              />
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-600">
                Sheet Preview
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handleDownloadFamilySheet}
            disabled={members.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" /> Download Combined 4x6" PDF
          </button>
        </div>
      </div>
    </div>
  );
};
