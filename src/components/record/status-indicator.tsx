import type { LucideProps } from "lucide-react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import type { ForwardRefExoticComponent, RefAttributes } from "react"

interface StatusIndicatorProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
  label: string
  status: string
  isOk: boolean
  tip: string
}

export default function StatusIndicator({ icon: Icon, label, status, isOk, tip }: StatusIndicatorProps) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
      <div className="flex-shrink-0 mt-1">
        <Icon className={`w-6 h-6 ${isOk ? "text-green-400" : "text-yellow-400"}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-white">{label}</p>
          <div className="flex items-center gap-2">
            <p className={`font-medium text-sm ${isOk ? "text-green-400" : "text-yellow-400"}`}>{status}</p>
            {isOk ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>
        {!isOk && <p className="text-sm text-slate-400">{tip}</p>}
      </div>
    </div>
  )
}
