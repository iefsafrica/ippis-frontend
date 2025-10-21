"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Check } from "lucide-react"

interface WebcamCaptureProps {
  onCapture: (file: File) => void
}

export function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 320 },
          facingMode: "user",
        },
        audio: false,
      })

      setStream(mediaStream)
      setIsCapturing(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing webcam:", err)
      setError("Could not access webcam. Please ensure you've granted camera permissions.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }, [stream])

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL("image/jpeg")
        setCapturedImage(dataUrl)

        // Convert data URL to File object
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "passport-photo.jpg", { type: "image/jpeg" })
              onCapture(file)
            }
          },
          "image/jpeg",
          0.95,
        )

        // Stop the camera
        stopCamera()
      }
    }
  }, [onCapture, stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 mb-2">{error}</p>
        <Button variant="outline" onClick={() => setError(null)} className="mt-2">
          Dismiss
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-md overflow-hidden aspect-square max-w-[320px] mx-auto">
        {isCapturing ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : capturedImage ? (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured passport"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Camera className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center gap-3">
        {!isCapturing && !capturedImage && (
          <Button type="button" onClick={startCamera} className="bg-green-700 hover:bg-green-800">
            <Camera className="mr-2 h-4 w-4" /> Start Camera
          </Button>
        )}

        {isCapturing && (
          <Button type="button" onClick={captureImage} className="bg-green-700 hover:bg-green-800">
            <Check className="mr-2 h-4 w-4" /> Capture Photo
          </Button>
        )}

        {capturedImage && (
          <Button
            type="button"
            variant="outline"
            onClick={retakePhoto}
            className="border-green-700 text-green-700 hover:bg-green-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retake Photo
          </Button>
        )}
      </div>
    </div>
  )
}
