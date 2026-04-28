import React, { useRef, useState, useEffect } from 'react';
import { Pen, Trash2, Check, Type } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  signerName: string;
}

type Mode = 'draw' | 'type';

const TYPED_FONTS = [
  { label: 'Signature', style: "italic 28px Georgia, serif" },
  { label: 'Print', style: "24px 'Courier New', monospace" },
  { label: 'Elegant', style: "italic bold 26px Palatino, serif" },
];

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, signerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<Mode>('draw');
  const [typedName, setTypedName] = useState(signerName);
  const [selectedFont, setSelectedFont] = useState(0);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getCtx = () => canvasRef.current?.getContext('2d');

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const drawTypedSignature = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = TYPED_FONTS[selectedFont].style;
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
    setIsEmpty(!typedName.trim());
  };

  useEffect(() => {
    if (mode === 'type') drawTypedSignature();
  }, [typedName, selectedFont, mode]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || !lastPos.current) return;

    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a237e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setIsEmpty(false);
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden w-full max-w-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pen size={18} className="text-primary-600" />
          <h3 className="font-semibold text-gray-800">Add Your Signature</h3>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => { setMode('draw'); clearCanvas(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'draw' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Pen size={12} /> Draw
          </button>
          <button
            onClick={() => { setMode('type'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'type' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Type size={12} /> Type
          </button>
        </div>
      </div>

      {/* Type mode controls */}
      {mode === 'type' && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 space-y-2">
          <input
            type="text"
            value={typedName}
            onChange={e => setTypedName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            {TYPED_FONTS.map((f, i) => (
              <button
                key={i}
                onClick={() => setSelectedFont(i)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                  selectedFont === i ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative px-5 pt-4 pb-2 bg-white">
        <div className="relative rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50">
          <canvas
            ref={canvasRef}
            width={460}
            height={160}
            className="w-full h-40 cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {isEmpty && mode === 'draw' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-300 text-sm select-none">Draw your signature here</p>
            </div>
          )}
          {/* Baseline */}
          <div className="absolute bottom-10 left-8 right-8 h-px bg-gray-300" />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center">
          By signing, you agree to the terms of this document
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-xl transition-colors"
        >
          <Trash2 size={13} /> Clear
        </button>
        <div className="flex-1" />
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isEmpty}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check size={15} />
          Sign Document
        </button>
      </div>
    </div>
  );
};
