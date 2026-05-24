"use client"

import { useState, useEffect } from "react"
import { verifyOfficePin } from "@/lib/actions"
import { motion } from "framer-motion"

export default function PinEntry({
  officeId,
  officeName,
  color,
  onSuccess,
  verifyFn,
}: {
  officeId: string
  officeName: string
  color: string
  onSuccess: () => void
  verifyFn?: (pin: string) => Promise<boolean>
}) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return
    const newPin = pin + digit
    setPin(newPin)
    setError(false)

    if (newPin.length === 4) {
      setChecking(true)
      const verify = verifyFn || ((p: string) => verifyOfficePin(officeId, p))
      verify(newPin).then((valid) => {
        if (valid) {
          onSuccess()
        } else {
          setError(true)
          setPin("")
        }
        setChecking(false)
      })
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-8 max-w-xs w-full"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center h-12 w-12 rounded-sm border border-border"
            style={{ backgroundColor: `${color}15` }}
          >
            <span className="font-mono text-sm font-medium" style={{ color }}>
              {officeId.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <h1 className="font-sans text-xl font-semibold text-foreground">
            {officeName}
          </h1>
          <p className="text-xs text-muted-foreground font-mono text-center">
            Enter operator PIN to access this panel
          </p>
        </div>

        {/* PIN dots */}
        <div className="flex items-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [0, -4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="h-3 w-3 rounded-full border transition-colors"
              style={{
                backgroundColor: i < pin.length ? color : "transparent",
                borderColor: i < pin.length ? color : error ? "var(--destructive)" : "var(--muted-foreground)",
                opacity: i < pin.length ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        {error && (
          <span className="font-mono text-xs text-destructive">
            Invalid PIN. Try again.
          </span>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
            (key) => {
              if (key === "") return <div key="empty" />
              if (key === "del") {
                return (
                  <button
                    key="del"
                    onClick={handleDelete}
                    disabled={checking}
                    className="flex items-center justify-center h-14 rounded-sm bg-secondary text-muted-foreground font-mono text-xs uppercase tracking-wider hover:bg-border transition-colors disabled:opacity-50"
                  >
                    Del
                  </button>
                )
              }
              return (
                <button
                  key={key}
                  onClick={() => handleDigit(key)}
                  disabled={checking}
                  className="flex items-center justify-center h-14 rounded-sm bg-secondary text-foreground font-mono text-lg hover:bg-border transition-colors disabled:opacity-50"
                >
                  {key}
                </button>
              )
            }
          )}
        </div>
      </motion.div>
    </div>
  )
}
