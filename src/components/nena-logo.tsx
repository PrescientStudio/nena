import type { SVGProps } from "react"

export default function NenaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 24" fill="none" {...props}>
      <text
        x="50"
        y="18"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        NENA
      </text>
    </svg>
  )
}
