import { useCallback, useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import { createPortal } from 'react-dom'
import { Check, RotateCcw, X } from 'lucide-react'
import 'react-easy-crop/react-easy-crop.css'

async function createImage(url) {
  const image = new Image()
  image.src = url
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })
  return image
}

async function getCroppedDataUrl(imageSrc, cropAreaPixels) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Unable to initialize crop canvas')
  }

  const sourceWidth = Math.max(1, Math.floor(cropAreaPixels.width))
  const sourceHeight = Math.max(1, Math.floor(cropAreaPixels.height))

  // Keep avatar payload small to avoid localStorage quota issues.
  const maxDimension = 320
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight))

  canvas.width = Math.max(1, Math.floor(sourceWidth * scale))
  canvas.height = Math.max(1, Math.floor(sourceHeight * scale))

  ctx.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  return canvas.toDataURL('image/webp', 0.72)
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onCancel,
  onConfirm,
  title = 'Crop Profile Photo',
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const canSave = useMemo(() => Boolean(croppedAreaPixels) && !isSaving, [croppedAreaPixels, isSaving])

  const onCropComplete = useCallback((_croppedArea, nextCroppedAreaPixels) => {
    setCroppedAreaPixels(nextCroppedAreaPixels)
  }, [])

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      setIsSaving(true)
      const croppedImage = await getCroppedDataUrl(imageSrc, croppedAreaPixels)
      onConfirm(croppedImage)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    onCancel()
  }

  if (!isOpen || !imageSrc) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/70 bg-white/95 p-4 shadow-[0_30px_80px_rgba(17,22,29,0.20)] md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="grid h-8 w-8 place-items-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-100"
          >
            <X size={14} />
          </button>
        </div>

        <div className="relative h-[min(52vh,360px)] min-h-[240px] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}x</span>
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-[#6352c8]"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setCrop({ x: 0, y: 0 })
              setZoom(1)
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6352c8] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(99,82,200,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={14} />
            {isSaving ? 'Applying...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
