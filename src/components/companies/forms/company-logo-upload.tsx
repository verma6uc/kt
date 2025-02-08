"use client"

interface CompanyLogoUploadProps {
  initialUrl?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function CompanyLogoUpload({ 
  initialUrl, 
  onChange, 
  disabled = false 
}: CompanyLogoUploadProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload logo')
      }

      const { url } = await response.json()
      onChange(url)
    } catch (error) {
      console.error('Error uploading logo:', error)
      // Handle error (could show toast notification)
    }
  }

  return (
    <div>
      <div className="flex items-center space-x-6">
        {initialUrl && (
          <div className="h-16 w-16 overflow-hidden rounded-lg">
            <img
              src={initialUrl}
              alt="Company logo"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
          <span>{initialUrl ? 'Change logo' : 'Upload logo'}</span>
          <input
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        PNG, JPG, GIF up to 10MB
      </p>
    </div>
  )
}