import { company_type, company_status } from '@prisma/client'
import { z } from 'zod'

export interface CompanyBasicInfo {
  name: string
  identifier: string
  description?: string
  website?: string
  type: company_type
}

export interface CompanyBusinessInfo {
  industry?: string
  employee_count: number
  status: company_status
}

export interface CompanyAddress {
  street?: string
  city?: string
  country?: string
  postal_code?: string
}

export interface CompanyContactInfo {
  email?: string
  phone?: string
  address: CompanyAddress
}

export interface CompanyRegistrationInfo {
  tax_id?: string
  registration_number?: string
}

export interface CompanyFormData {
  basicInfo: CompanyBasicInfo
  businessInfo: CompanyBusinessInfo
  contactInfo: CompanyContactInfo
  registrationInfo: CompanyRegistrationInfo
  logoUrl?: string
}

// Props interfaces with validation errors
export interface ValidationErrors {
  formErrors: string[]
  fieldErrors: Record<string, string[]>
}

export interface CompanyBasicInfoProps {
  initialData: CompanyBasicInfo
  onChange: (data: Partial<CompanyBasicInfo>) => void
  errors?: {
    formErrors: string[]
    fieldErrors: Record<string, string[]>
  }
}

export interface CompanyBusinessInfoProps {
  initialData: CompanyBusinessInfo
  onChange: (data: Partial<CompanyBusinessInfo>) => void
  errors?: ValidationErrors
}

export interface CompanyContactInfoProps {
  initialData: CompanyContactInfo
  onChange: (data: Partial<CompanyContactInfo>) => void
  errors?: ValidationErrors
}

export interface CompanyRegistrationInfoProps {
  initialData: CompanyRegistrationInfo
  onChange: (data: Partial<CompanyRegistrationInfo>) => void
  errors?: ValidationErrors
}

// Zod schemas for validation
export const companyBasicInfoSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  identifier: z.string().min(1, 'Company identifier is required'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  type: z.enum(['enterprise', 'small_business', 'startup'] as const)
})

export const companyBusinessInfoSchema = z.object({
  industry: z.string().optional(),
  employee_count: z.number().min(0),
  status: z.enum(['active', 'inactive', 'pending_setup', 'suspended'] as const)
})

export const companyAddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional()
})

export const companyContactInfoSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: companyAddressSchema
})

export const companyRegistrationInfoSchema = z.object({
  tax_id: z.string().optional(),
  registration_number: z.string().optional()
})

export const companyFormSchema = z.object({
  basicInfo: companyBasicInfoSchema,
  businessInfo: companyBusinessInfoSchema,
  contactInfo: companyContactInfoSchema,
  registrationInfo: companyRegistrationInfoSchema,
  logoUrl: z.string().optional()
})