export interface ThemeSettings {
  // Colors
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  accentForeground: string
  destructive: string
  border: string
  ring: string

  // Font Sizes (in rem)
  baseFontSize: number
  headingFontSize: number
  monoFontSize: number

  // Radius (in rem)
  radius: number

  // Display Page Settings
  displayTicketSize: number
  displayCounterSize: number
  displayBgColor: string
  displayTextColor: string

  // Operator Page Settings
  operatorTicketSize: number
  operatorBgColor: string
  operatorTextColor: string
}

export const DARK_THEME: ThemeSettings = {
  background: "#0A0A0A",
  foreground: "#F0EDE8",
  card: "#111111",
  cardForeground: "#F0EDE8",
  primary: "#F5A623",
  primaryForeground: "#0A0A0A",
  secondary: "#1A1A1A",
  secondaryForeground: "#F0EDE8",
  accent: "#F5A623",
  accentForeground: "#0A0A0A",
  destructive: "#E53E3E",
  border: "#222222",
  ring: "#F5A623",
  baseFontSize: 1,
  headingFontSize: 1.5,
  monoFontSize: 0.875,
  radius: 0.25,
  displayTicketSize: 12,
  displayCounterSize: 1.2,
  displayBgColor: "#0A0A0A",
  displayTextColor: "#F0EDE8",
  operatorTicketSize: 1,
  operatorBgColor: "#0A0A0A",
  operatorTextColor: "#F0EDE8",
}

export const LIGHT_THEME: ThemeSettings = {
  background: "#FFFFFF",
  foreground: "#0A0A0A",
  card: "#F5F5F5",
  cardForeground: "#0A0A0A",
  primary: "#2563EB",
  primaryForeground: "#FFFFFF",
  secondary: "#E5E7EB",
  secondaryForeground: "#0A0A0A",
  accent: "#2563EB",
  accentForeground: "#FFFFFF",
  destructive: "#EF4444",
  border: "#D1D5DB",
  ring: "#2563EB",
  baseFontSize: 1,
  headingFontSize: 1.5,
  monoFontSize: 0.875,
  radius: 0.25,
  displayTicketSize: 12,
  displayCounterSize: 1.2,
  displayBgColor: "#FFFFFF",
  displayTextColor: "#0A0A0A",
  operatorTicketSize: 1,
  operatorBgColor: "#FFFFFF",
  operatorTextColor: "#0A0A0A",
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = DARK_THEME
