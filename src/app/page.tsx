import { ArrowRight, Globe, LayoutDashboard, FileCode } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="apple-heading animate-fade-up">
            Design that inspires.<br />
            Experience that matters.
          </h1>
          <p className="apple-subheading mt-6 animate-fade-up">
            Create beautiful, responsive, and accessible web applications with our Apple-inspired design system. Built with Next.js and Tailwind CSS.
          </p>
          <div className="mt-10 flex gap-4 animate-fade-up">
            <button className="apple-button">
              Get Started
              <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="apple-card">
              <Globe className="w-10 h-10 text-apple-gray-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Design Language</h3>
              <p className="text-apple-gray-400">
                Consistent and beautiful design patterns that work across all platforms and devices.
              </p>
            </div>
            
            <div className="apple-card">
              <LayoutDashboard className="w-10 h-10 text-apple-gray-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Responsive Components</h3>
              <p className="text-apple-gray-400">
                Carefully crafted components that adapt seamlessly to any screen size.
              </p>
            </div>
            
            <div className="apple-card">
              <FileCode className="w-10 h-10 text-apple-gray-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Developer Friendly</h3>
              <p className="text-apple-gray-400">
                Built with modern technologies and best practices for a smooth development experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-apple-gray-400 text-sm">
        <p>Designed with precision. Built with passion.</p>
      </footer>
    </div>
  )
}
