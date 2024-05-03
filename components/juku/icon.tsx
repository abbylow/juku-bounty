"use client"

import { useTheme } from 'next-themes'
import { IconProps, Icons } from '@/components/icons'

export function JukuIcon(props: IconProps) {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme ? (theme === "system" ? systemTheme : theme) : "light"
console.log(currentTheme)
  if (currentTheme === "dark") {
    return (
      <Icons.logoDark {...props} />
    )
  }
  return (
    <Icons.logo {...props} />
  )
}

