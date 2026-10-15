"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, AlertCircle, VideoOff, SwitchCamera } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
  initialImage?: string | null;
}

export function WebcamCapture({ onCapture, onCancel, initialImage }: WebcamCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialImage || null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Enumerate video devices
  const enumerateDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setAvailableDevices(videoInputs);
      }
    } catch (e) {
      console.warn("Could not enumerate camera devices:", e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      setStream(null);
    }
    setIsCapturing(false);
    setIsStarting(false);
  }, [stream]);

  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setIsStarting(true);
      setError(null);

      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in this browser. Please use 'Upload from Computer'.");
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 640 } }
          : { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCapturing(true);
      setIsStarting(false);

      await enumerateDevices();
    } catch (err: any) {
      console.error("Error accessing webcam:", err);
      setIsStarting(false);
      setIsCapturing(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access in your browser or choose 'Upload Image from Computer'.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera found on this device. Please connect a webcam or switch to 'Upload Image from Computer'.");
      } else {
        setError(err.message || "Could not access webcam. Please ensure your camera is not in use by another app.");
      }
    }
  }, [stream, enumerateDevices]);

  // Ensure video element receives the stream as soon as it mounts or stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn("Video play error (can be ignored if autoplay restricted):", err);
      });
    }
  }, [stream, isCapturing]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth && video.videoHeight) {
        // Create square crop for passport
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;

        canvas.width = size;
        canvas.height = size;

        // Draw cropped square frame
        context.drawImage(video, startX, startY, size, size, 0, 0, size, size);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setCapturedImage(dataUrl);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `passport-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              onCapture(file);
            }
          },
          "image/jpeg",
          0.95
        );

        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera(selectedDeviceId || undefined);
  }, [startCamera, selectedDeviceId]);

  const switchCamera = useCallback(() => {
    if (availableDevices.length > 1) {
      const currentIndex = availableDevices.findIndex((d) => d.deviceId === selectedDeviceId);
      const nextIndex = (currentIndex + 1) % availableDevices.length;
      const nextDevice = availableDevices[nextIndex];
      setSelectedDeviceId(nextDevice.deviceId);
      startCamera(nextDevice.deviceId);
    }
  }, [availableDevices, selectedDeviceId, startCamera]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-800">Camera Access Error</p>
            <p className="text-red-700 mt-0.5">{error}</p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => startCamera(selectedDeviceId || undefined)}
                className="text-xs bg-white text-red-700 border-red-300 hover:bg-red-50"
              >
                Try Again
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onCancel}
                  className="text-xs text-gray-600"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera Viewfinder / Preview Container */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-square max-w-[340px] mx-auto border-2 border-slate-300 shadow-md">
        {isCapturing ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Passport Oval Guideline Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[68%] h-[82%] border-2 border-dashed border-white/80 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex flex-col items-center justify-between py-4">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Align Face Here
                </span>
                <span className="text-[10px] font-medium text-white/90 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Keep Chin Inside Oval
                </span>
              </div>
            </div>
          </>
        ) : capturedImage ? (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured passport photograph"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] py-1 px-2.5 rounded-md text-center font-medium">
              Photo Captured Successfully
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              <Camera className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-200">Live Photo Capture</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Take an official passport photo using your device webcam.
            </p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Camera Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        {!isCapturing && !capturedImage && (
          <Button
            type="button"
            onClick={() => startCamera(selectedDeviceId || undefined)}
            disabled={isStarting}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm gap-2"
          >
            <Camera className="h-4 w-4" />
            {isStarting ? "Starting Camera..." : "Start Camera"}
          </Button>
        )}

        {isCapturing && (
          <>
            <Button
              type="button"
              onClick={captureImage}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm gap-2 px-5"
            >
              <Check className="h-4 w-4" /> Capture Photo
            </Button>

            {availableDevices.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={switchCamera}
                title="Switch Camera"
                className="border-slate-300"
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <VideoOff className="h-4 w-4 mr-1.5" /> Stop
            </Button>
          </>
        )}

        {capturedImage && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={retakePhoto}
              className="border-emerald-700 text-emerald-700 hover:bg-emerald-50 gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Retake Photo
            </Button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-500">
        Ensure good lighting with a plain light-colored background and your face clearly visible.
      </p>
    </div>
  );
}
