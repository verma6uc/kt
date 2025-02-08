"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

interface FormErrors {
  email?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  // Clear errors when inputs change
  useEffect(() => {
    setErrors({})
  }, [email])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            setErrors({ general: "Invalid email" })
            break
          case 'AccessDenied':
            setErrors({ general: "Your account has been suspended" })
            break
          case 'AccountLocked':
            setErrors({ general: "Your account has been locked" })
            break
          default:
            setErrors({ general: "An error occurred. Please try again." })
        }
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-gray-50 to-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/[0.02] backdrop-blur-[1px]"></div>
      <div className="relative w-full max-w-md p-4">
        {/* Frosted glass card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-lg shadow-xl p-8 space-y-6 border border-white/20 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>

          <div className="flex justify-center mb-8">
            <Image
              src="/yuvi-logo.svg"
              alt="Yuvi Logo"
              width={120}
              height={40}
              priority
              className="relative"
            />
          </div>

          <h2 className="text-2xl font-semibold text-center text-gray-900 relative">
            Sign in to continue
          </h2>

          {errors.general && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-sm relative flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 bg-white/50 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                autoComplete="username"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}