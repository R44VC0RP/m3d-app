"use client";

import file_upload_icon from "@/public/file-upload-icon.png";
import stl_file_icon from "@/public/stl-file-icon.png";
import fileuploadicon from "@/public/uploadfile.png";
import processing from "@/public/processing.png";
import quote from "@/public/quote.png";
import cart from "@/public/cart.png";
import orderplaced from "@/public/orderplaced.png";
import delivered from "@/public/delivered.png";
import { IoTrashOutline } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineExclamationCircle } from "react-icons/ai";

import { useRef, useState } from "react";
import Image from "next/image";

interface FileUploadProps {
  currentStep?: number;
}

const STEPS = [
  {
    icon: fileuploadicon,
    label: "Upload STL File",
    description: "Upload your 3D model file",
  },
  {
    icon: processing,
    label: "Processing",
    description: "Analyzing model and preparing for print",
  },
  {
    icon: quote,
    label: "Quote Ready",
    description: "Review your custom quote",
  },
  {
    icon: cart,
    label: "Add to cart",
    description: "Confirm details and add to cart",
  },
  {
    icon: orderplaced,
    label: "Order Placed",
    description: "Your model is being printed",
  },
  {
    icon: delivered,
    label: "Delivered",
    description: "Arrives in about 5 business days",
  },
];

const ACCEPTED_FILE_TYPE = ".stl";
const FILE_SIZE_CAP = 50;

export function FileUpload({ currentStep = 0 }: FileUploadProps) {
  const [file, setFile] = useState<File>();
  const [isDragging, setIsDragging] = useState(false);
  const [fileInputError, setFileInputError] = useState<
    "multiple_files" | "file_size" | "wrong_type" | "upload_error" | null
  >(null);
  const [uploadProgress, setUploadProgress] = useState<{
    [fileName: string]: number;
  }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (file: File) => {
    // const xhr = new XMLHttpRequest();
    // const formData = new FormData();
    // formData.append('file', file, file.name);

    // xhr.upload.onprogress = (event) => {
    //   if (event.lengthComputable) {
    //     const percentComplete = Math.round((event.loaded / event.total) * 100);
    //     setUploadProgress({
    //       [file.name]: percentComplete,
    //     });
    //   }
    // };

    // xhr.onreadystatechange = () => {
    //   if (xhr.readyState === XMLHttpRequest.DONE) {
    //     if (xhr.status === 200) {
    //       console.log(`File ${file.name} uploaded successfully.`);
    //     } else {
    //       console.error(`Error uploading file ${file.name}.`);
    //       setFileInputError("upload_error")
    //     }
    //   }
    // };

    // xhr.open('POST', '/api/upload', true);
    // xhr.send(formData);

    // TODO: Create reciprocal backend handler for this

    const intervalId = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[file.name] ?? 0;
        if (currentProgress >= 100) {
          clearInterval(intervalId);
          return prev;
        }
        return {
          ...prev,
          [file.name]: currentProgress + 1,
        };
      });
    }, 50);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!e.dataTransfer?.items && !e.dataTransfer?.items.length) {
      return;
    }

    if (e.dataTransfer.items.length > 1) {
      setFileInputError("multiple_files");
      return;
    }

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const draggedFiles = Array.from(e.dataTransfer.items);
      const acceptedMimeTypes = ACCEPTED_FILE_TYPE;

      const areFilesAccepted = draggedFiles.every(
        (item) => item.kind === "file" && acceptedMimeTypes.includes(item.type)
      );

      if (areFilesAccepted) {
        setIsDragging(true);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setFileInputError(null);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length !== 1) {
      setFileInputError("multiple_files");
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length === 1) {
      const droppedFile = Array.from(e.dataTransfer.files)[0];

      if (droppedFile.size > 50 * 1024 * 1024) {
        // 50MB size
        setFileInputError("file_size");
        return;
      }

      const acceptedMimeTypes = ACCEPTED_FILE_TYPE;
      const validFile = acceptedMimeTypes.includes(droppedFile.type);

      if (validFile) {
        setFile(droppedFile);
        setFileInputError(null);
        handleUpload(droppedFile);
      } else {
        setFileInputError("wrong_type");
      }
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length === 1) {
      const selectedFile = Array.from(e.target.files)[0];
      if (selectedFile.size > FILE_SIZE_CAP * 1024 * 1024) {
        // 50MB size
        setFileInputError("file_size");
        return;
      }
      setFile(selectedFile);
      setFileInputError(null);
      handleUpload(selectedFile);
    }
  };

  const openFileDialog = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleRemove = () => {
    setFile(undefined);
    setUploadProgress({});
    // TODO: need to send appropriate req to backend to delete the saved file
  };

  return (
    <section className="py-10 sm:py-16 px-4">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-medium">Upload Your 3D Model</h2>
        <p className="text-sm sm:text-base text-neutral-500">
          Drop your STL file and we'll help you bring it to life.
        </p>
      </div>
      <div className="mt-6 sm:mt-8 flex flex-col lg:flex-row justify-between gap-8 lg:gap-24">
        <div className="flex-1 order-1">
          <div className="flex gap-8">
            {/* Upload Area */}
            <div className="w-full">
              <div
                className={`border-1 border-dashed rounded-sm py-16 sm:py-28 text-center cursor-pointer transition-colors
                  ${
                    isDragging
                      ? "border-[#466F80] bg-[#466F80]/10"
                      : "border-gray-300 bg-gray-100/50 hover:border-[#466F80] hover:bg-[#466F80]/10"
                  }`}
                onDragOver={(e) => handleDragOver(e)}
                onDragLeave={(e) => handleDragLeave(e)}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple={false}
                  accept={ACCEPTED_FILE_TYPE}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 px-4">
                  <Image
                    src={file_upload_icon}
                    alt="File upload"
                    className={`w-1/2 sm:w-1/3 max-w-[150px]`}
                  />
                  {isDragging ? (
                    <div>
                      <p className="text-lg text-gray-500">
                        Drop the file here...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  ) : fileInputError === "multiple_files" ? (
                    <div>
                      <p className="text-base flex gap-1 items-center text-red-500/90">
                        <AiOutlineExclamationCircle /> You can only upload one
                        file
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  ) : fileInputError === "file_size" ? (
                    <div>
                      <p className="text-base flex gap-1 items-center text-red-500/90">
                        <AiOutlineExclamationCircle /> The file size must be
                        less than {FILE_SIZE_CAP} MB
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  ) : fileInputError === "upload_error" ? (
                    <div>
                      <p className="text-base flex gap-1 items-center text-red-500/90">
                        <AiOutlineExclamationCircle /> Upload failed, please try
                        again
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  ) : fileInputError === "wrong_type" ? (
                    <div>
                      <p className="text-base flex gap-1 items-center text-red-500/90">
                        <AiOutlineExclamationCircle /> The file must have .stl
                        extension
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-base text-gray-500">
                        Click to upload{" "}
                        <span className="text-gray-500/80">
                          or drag and drop
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-gray-50 rounded-sm items-center justify-between border border-neutral-300">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={stl_file_icon}
                        alt="File Icon"
                        className="w-[25px]"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        {/* Progress Bar */}
                      </div>
                    </div>
                    <button
                      onClick={handleRemove}
                      className={`p-2 text-gray-500 hover:text-red-500 disabled:text-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed`}
                      type="button"
                      disabled={uploadProgress[file.name] !== 100}
                    >
                      <IoTrashOutline className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-[#466F80] h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress[file.name] || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">
                      {uploadProgress[file.name] || 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 order-2 hidden lg:block">
          {/* Progress Steps - Hidden on mobile */}
          <div className="w-full">
            <div className="relative">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isLastStep = index === STEPS.length - 1;

                return (
                  <div key={step.label} className="relative">
                    <div className="flex justify-between items-center pb-6">
                      <div
                        className={`flex flex-1 items-center gap-4 px-4 py-2 pr-5 max-w-7/9 rounded-lg transition-all duration-300 ease-out transform
                          ${
                            isActive
                              ? "bg-neutral-300/10 border border-neutral-300 scale-103 translate-x-1"
                              : isCompleted
                              ? "bg-neutral-300/10 border border-neutral-200"
                              : "bg-gray-50"
                          }`}
                      >
                        <div
                          className={`rounded-full p-2 transition-all duration-300 ease-out transform
                          ${
                            isActive
                              ? "bg-neutral-300/40 text-neutral-300 scale-110"
                              : isCompleted
                              ? "bg-neutral-400/20 text-neutral-500/90 scale-90"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <IoMdCheckmark className="w-[16px]" />
                          ) : (
                            <Image src={Icon} alt="" className="w-[16px]" />
                          )}
                        </div>
                        <div>
                          <h3
                            className={`font-medium mb-1
                            ${
                              isActive
                                ? "text-neutral-700"
                                : isCompleted
                                ? "text-neutral-600"
                                : "text-gray-400/60 font-normal"
                            }`}
                          >
                            {step.label}
                          </h3>
                          <p
                            className={`text-sm
                            ${
                              isActive
                                ? "text-[#466F80]"
                                : isCompleted
                                ? "text-[#334E58]"
                                : "text-gray-400/60"
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`rounded-full border border-neutral-200/70 w-8 h-8 flex items-center justify-center font-medium z-10 transition-all duration-300 ease-out transform
                          ${
                            isActive
                              ? "bg-neutral-100 border border-neutral-300 scale-110 text-sm"
                              : isCompleted
                              ? "bg-neutral-50 border border-neutral-200 text-xs"
                              : "bg-white text-xs"
                          } cursor-default`}
                        >
                          {index + 1}
                        </div>
                        {!isLastStep && (
                          <div
                            className={`absolute top-8 w-[1px] h-16 transition-all duration-1000 ease-in-out ${
                              isCompleted
                                ? "bg-neutral-300"
                                : "bg-neutral-200/60"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
