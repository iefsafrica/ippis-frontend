// "use client"

// import type React from "react"

// import { useState, useRef } from "react"
// import { Upload } from "lucide-react"

// interface FileUploaderProps {
//   onFileSelect: (file: File) => void
//   accept?: string
//   maxSize?: number
//   error?: string
// }

// export function FileUploader({ onFileSelect, accept = "*", maxSize = 5 * 1024 * 1024, error }: FileUploaderProps) {
//   const [isDragging, setIsDragging] = useState(false)
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setIsDragging(true)
//   }

//   const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setIsDragging(false)
//   }

//   const validateFile = (file: File): boolean => {
//     // Check file size
//     if (file.size > maxSize) {
//       setErrorMessage(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`)
//       return false
//     }

//     // Check file type if accept is specified
//     if (accept !== "*") {
//       const acceptedTypes = accept.split(",").map((type) => type.trim())
//       const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
//       const fileType = file.type

//       const isAccepted = acceptedTypes.some((type) => {
//         if (type.startsWith(".")) {
//           // Check by extension
//           return fileExtension === type.toLowerCase()
//         } else {
//           // Check by MIME type
//           return fileType.match(new RegExp(type.replace("*", ".*")))
//         }
//       })

//       if (!isAccepted) {
//         setErrorMessage(`File type not accepted. Please upload ${accept} files.`)
//         return false
//       }
//     }

//     setErrorMessage(null)
//     return true
//   }

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setIsDragging(false)

//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       const file = e.dataTransfer.files[0]
//       if (validateFile(file)) {
//         onFileSelect(file)
//       }
//     }
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0]
//       if (validateFile(file)) {
//         onFileSelect(file)
//       }
//     }
//   }

//   const handleButtonClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click()
//     }
//   }

//   return (
//     <div
//       className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
//         isDragging ? "border-green-500 bg-green-50" : error ? "border-red-300" : "border-gray-300 hover:border-gray-400"
//       }`}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//       onClick={handleButtonClick}
//     >
//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         accept={accept}
//         className="hidden"
//         data-testid="file-input"
//       />
//       <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
//       <p className="text-sm text-gray-600 mb-1">Drag and drop your file here, or click to browse</p>
//       <p className="text-xs text-gray-500">
//         {accept !== "*" ? `Accepted formats: ${accept}` : "All file types accepted"} (Max size:{" "}
//         {maxSize / (1024 * 1024)}
//         MB)
//       </p>
//       {errorMessage && <p className="text-red-500 text-xs mt-2">{errorMessage}</p>}
//       {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
//     </div>
//   )
// }
"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File, base64: string) => void;
  accept?: string;
  maxSize?: number;
  error?: string;
}

export  function FileUploader({
  onFileSelect,
  accept = "*",
  maxSize = 5 * 1024 * 1024,
  error,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setErrorMessage(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`);
      return false;
    }

    if (accept !== "*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const fileType = file.type;

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension === type.toLowerCase();
        } else {
          return fileType.match(new RegExp(type.replace("*", ".*")));
        }
      });

      if (!isAccepted) {
        setErrorMessage(
          `File type not accepted. Please upload ${accept} files.`
        );
        return false;
      }
    }

    setErrorMessage(null);
    return true;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (validateFile(file)) {
      const base64 = await convertToBase64(file);
      localStorage.setItem("uploadedFile", base64); // Store in localStorage
      onFileSelect(file, base64);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-green-500 bg-green-50"
          : error
          ? "border-red-300"
          : "border-gray-300 hover:border-gray-400"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-600 mb-1">
        Drag and drop your file here, or click to browse
      </p>
      <p className="text-xs text-gray-500">
        {accept !== "*"
          ? `Accepted formats: ${accept}`
          : "All file types accepted"}{" "}
        (Max size: {maxSize / (1024 * 1024)}MB)
      </p>
      {errorMessage && (
        <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
      )}
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
