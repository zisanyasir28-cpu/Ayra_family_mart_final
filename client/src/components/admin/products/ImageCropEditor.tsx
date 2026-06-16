import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { X, Check, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Canvas crop helper ───────────────────────────────────────────────────────

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.src = url;
  });
}

/** Crops `imageSrc` to the given pixel area and returns a PNG blob. */
export async function getCroppedBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image  = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width  = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(
    image,
    area.x, area.y, area.width, area.height,
    0, 0, area.width, area.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      'image/png',
    );
  });
}

// ─── Aspect presets ───────────────────────────────────────────────────────────

const ASPECTS: { label: string; value: number | 'original' }[] = [
  { label: 'Original', value: 'original' },
  { label: '1:1',      value: 1 },
  { label: '4:5',      value: 4 / 5 },
  { label: '3:4',      value: 3 / 4 },
  { label: '16:9',     value: 16 / 9 },
];

// ─── Editor ───────────────────────────────────────────────────────────────────

interface ImageCropEditorProps {
  src:      string;
  onCancel: () => void;
  onApply:  (blob: Blob) => void;
}

export function ImageCropEditor({ src, onCancel, onApply }: ImageCropEditorProps) {
  const [crop, setCrop]                     = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                     = useState(1);
  const [aspectKey, setAspectKey]           = useState<number | 'original'>('original');
  const [originalAspect, setOriginalAspect] = useState(1);
  const [pixels, setPixels]                 = useState<Area | null>(null);
  const [busy, setBusy]                     = useState(false);

  const aspect = aspectKey === 'original' ? originalAspect : aspectKey;

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setPixels(areaPixels);
  }, []);

  async function apply() {
    if (!pixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(src, pixels);
      onApply(blob);
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Crop &amp; position</h3>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close cropper"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cropper stage */}
        <div className="relative h-72 w-full bg-neutral-900 sm:h-80">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            minZoom={1}
            maxZoom={3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={(m) => setOriginalAspect(m.naturalWidth / m.naturalHeight)}
            objectFit="contain"
          />
        </div>

        {/* Controls */}
        <div className="space-y-3 px-5 py-4">
          {/* Aspect ratio */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-muted-foreground">Ratio</span>
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setAspectKey(a.value)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  aspectKey === a.value
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:bg-muted',
                )}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer accent-primary"
              aria-label="Zoom"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Drag the image to reposition · slider to zoom · pick a ratio
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={busy || !pixels}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {busy ? 'Applying…' : 'Apply crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
