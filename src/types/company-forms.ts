export interface CompanyBasicInfo {
  name: string
  identifier: string
  description?: string
  website?: string
  type: string
}

export interface CompanyBusinessInfo {
  industry?: string
  employee_count?: number
  status: string
}

export interface CompanyContactInfo {
  email: string
  phone: string
  address: {
    street: string
    city: string
    state?: string
    country: string
    postal_code: string
  }
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
  logoUrl: string
}

export interface CompanyBasicInfoProps {
  initialData: Partial<CompanyBasicInfo>
  onChange: (data: Partial<CompanyBasicInfo>) => void
}

export interface CompanyBusinessInfoProps {
  initialData: Partial<CompanyBusinessInfo>
  onChange: (data: Partial<CompanyBusinessInfo>) => void
}

export interface CompanyContactInfoProps {
  initialData: Partial<CompanyContactInfo>
  onChange: (data: Partial<CompanyContactInfo>) => void
}

export interface CompanyRegistrationInfoProps {
  initialData: Partial<CompanyRegistrationInfo>
  onChange: (data: Partial<CompanyRegistrationInfo>) => void
}

export interface CompanyLogoUploadProps {
  initialUrl?: string
  onChange: (url: string) => void
}