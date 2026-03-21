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
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
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
}
