"use client"

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { useToast } from '@/components/providers/toast-provider'

interface Option {
  label: string
  value: string
}

interface MultiselectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  label?: string
}

export function Multiselect({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  label
}: MultiselectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOptions = options.filter(option => value.includes(option.value))

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const handleRemoveOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== optionValue))
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
    showToast({
      type: 'info',
      title: 'Filters Cleared',
      message: `All ${label?.toLowerCase() || 'filter'} selections have been cleared`
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className="min-h-[38px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            <>
              {selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-sm"
                >
                  {option.label}
                  <button
                    onClick={(e) => handleRemoveOption(e, option.value)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </>
          )}
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {value.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1 hover:text-gray-600 text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {options.map(option => (
              <li
                key={option.value}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100 ${
                  value.includes(option.value) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleToggleOption(option.value)}
              >
                <span>{option.label}</span>
                {value.includes(option.value) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}