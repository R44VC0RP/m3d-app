"use client"

import { FaCloudUploadAlt, FaFile, FaTrash, FaCheck, FaCog, FaTruck, FaBox } from 'react-icons/fa'

interface FileUploadProps {
  isDragActive?: boolean
  selectedFile?: {
    name: string
    size: number
  } | null
  onRemove?: () => void
  currentStep?: number
}

const STEPS = [
  { icon: FaFile, label: 'Upload STL File', description: 'Upload your 3D model file' },
  { icon: FaCog, label: 'Processing', description: 'Analyzing model and preparing for print' },
  { icon: FaBox, label: 'Quote Ready', description: 'Review your custom quote' },
  { icon: FaTruck, label: 'Order Placed', description: 'Your model is being printed' }
]

export function FileUpload({ 
  isDragActive = false,
  selectedFile = null,
  onRemove,
  currentStep = 0
}: FileUploadProps) {
  return (
    <section className="py-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium text-center">Upload Your 3D Model</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Have a custom 3D model you'd like to print? Upload your STL file and we'll help you bring it to life.
        </p>
        
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div className="w-full">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-[#466F80] bg-[#466F80]/10' 
                  : 'border-gray-300 hover:border-[#466F80] hover:bg-[#466F80]/10'
                }`}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <FaCloudUploadAlt className="w-12 h-12 text-gray-400" />
                {isDragActive ? (
                  <p className="text-lg text-gray-600">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-lg text-gray-600">
                      Drag & drop your STL file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum file size: 50MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaFile className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={onRemove}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  type="button"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="w-full">
            <div className="space-y-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                
                return (
                  <div
                    key={step.label}
                    className={`flex items-start gap-4 p-4 rounded-lg transition-colors
                      ${isActive ? 'bg-[#466F80]/10 border border-[#466F80]' :
                        isCompleted ? 'bg-[#334E58]/10 border border-[#334E58]' :
                        'bg-gray-50 border border-gray-200'}`}
                  >
                    <div className={`rounded-full p-2
                      ${isActive ? 'bg-[#466F80]/20 text-[#466F80]' :
                        isCompleted ? 'bg-[#334E58]/20 text-[#334E58]' :
                        'bg-gray-100 text-gray-400'}`}
                    >
                      {isCompleted ? <FaCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className={`font-medium
                        ${isActive ? 'text-[#466F80]' :
                          isCompleted ? 'text-[#334E58]' :
                          'text-gray-900'}`}
                      >
                        {step.label}
                      </h3>
                      <p className={`text-sm
                        ${isActive ? 'text-[#466F80]' :
                          isCompleted ? 'text-[#334E58]' :
                          'text-gray-500'}`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 