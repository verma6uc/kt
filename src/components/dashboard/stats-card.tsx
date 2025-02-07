import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  iconColor?: string
  subtitleColor?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  subtitleColor = "text-gray-600"
}: StatsCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className={`ml-2 text-sm font-medium ${subtitleColor}`}>
                  {subtitle}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
