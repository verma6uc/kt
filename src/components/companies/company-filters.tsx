"use client"

import { Fragment, useState } from "react"
import { Menu, Transition } from "@headlessui/react"
import { ChevronDown, Search, X } from "lucide-react"
import clsx from "clsx"

const statusFilters = [
  { name: "Active", value: "active" },
  { name: "Pending Setup", value: "pending_setup" },
  { name: "Suspended", value: "suspended" },
  { name: "Inactive", value: "inactive" },
]

const typeFilters = [
  { name: "Enterprise", value: "enterprise" },
  { name: "Small Business", value: "small_business" },
  { name: "Startup", value: "startup" },
]

const industryFilters = [
  { name: "Technology", value: "technology" },
  { name: "Healthcare", value: "healthcare" },
  { name: "Finance", value: "finance" },
  { name: "Education", value: "education" },
  { name: "Manufacturing", value: "manufacturing" },
  { name: "Retail", value: "retail" },
  { name: "Other", value: "other" },
]

interface CompanyFiltersProps {
  onStatusChange?: (values: string[]) => void
  onTypeChange?: (values: string[]) => void
  onIndustryChange?: (values: string[]) => void
  onSearchChange?: (value: string) => void
}

export default function CompanyFilters({
  onStatusChange,
  onTypeChange,
  onIndustryChange,
  onSearchChange,
}: CompanyFiltersProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const handleStatusToggle = (value: string) => {
    const newStatuses = selectedStatuses.includes(value)
      ? selectedStatuses.filter(s => s !== value)
      : [...selectedStatuses, value]
    setSelectedStatuses(newStatuses)
    onStatusChange?.(newStatuses)
  }

  const handleTypeToggle = (value: string) => {
    const newTypes = selectedTypes.includes(value)
      ? selectedTypes.filter(t => t !== value)
      : [...selectedTypes, value]
    setSelectedTypes(newTypes)
    onTypeChange?.(newTypes)
  }

  const handleIndustryToggle = (value: string) => {
    const newIndustries = selectedIndustries.includes(value)
      ? selectedIndustries.filter(i => i !== value)
      : [...selectedIndustries, value]
    setSelectedIndustries(newIndustries)
    onIndustryChange?.(newIndustries)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  const FilterDropdown = ({ 
    label, 
    options, 
    selected, 
    onToggle 
  }: { 
    label: string
    options: { name: string; value: string }[]
    selected: string[]
    onToggle: (value: string) => void
  }) => (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="group inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        {label}
        {selected.length > 0 && (
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            {selected.length}
          </span>
        )}
        <ChevronDown
          className="ml-2 h-5 w-5 flex-none text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <div
                    className={clsx(
                      active ? "bg-gray-50" : "",
                      "flex items-center px-4 py-2 cursor-pointer"
                    )}
                    onClick={() => onToggle(option.value)}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option.value)}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {option.name}
                    </span>
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search companies..."
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <FilterDropdown
          label="Status"
          options={statusFilters}
          selected={selectedStatuses}
          onToggle={handleStatusToggle}
        />
        <FilterDropdown
          label="Type"
          options={typeFilters}
          selected={selectedTypes}
          onToggle={handleTypeToggle}
        />
        <FilterDropdown
          label="Industry"
          options={industryFilters}
          selected={selectedIndustries}
          onToggle={handleIndustryToggle}
        />
      </div>
    </div>
  )
}