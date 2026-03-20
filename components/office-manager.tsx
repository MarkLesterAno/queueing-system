"use client"

import { useState } from "react"
import { addOffice, updateOffice, deleteOffice } from "@/lib/actions"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface OfficeFormData {
  id: string
  name: string
  abbreviation: string
  prefix: string
  color: string
  counters: number
  pin: string
}

interface OfficeCard {
  id: string
  name: string
  abbreviation: string
  prefix: string
  color: string
  counters: number
  queueDepth: number
  avgWaitMinutes: number
  ticketsServed: number
  activeTickets: number
  totalCounters: number
  idleCounters: number
}

interface OfficeManagerProps {
  offices: OfficeCard[]
  onMutate: () => void
}

const DEFAULT_COLORS = [
  "#5B8C6A",
  "#C4845C",
  "#7A8CBE",
  "#B57B9E",
  "#8B9E6B",
  "#9E8B6B",
  "#6B8B9E",
  "#8B6B6B",
]

export default function OfficeManager({ offices, onMutate }: OfficeManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [formData, setFormData] = useState<OfficeFormData>({
    id: "",
    name: "",
    abbreviation: "",
    prefix: "",
    color: DEFAULT_COLORS[0],
    counters: 2,
    pin: "1234",
  })

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      abbreviation: "",
      prefix: "",
      color: DEFAULT_COLORS[0],
      counters: 2,
      pin: "1234",
    })
    setEditingId(null)
    setIsAddMode(false)
    setError("")
  }

  const closeModal = () => {
    resetForm()
    setIsModalOpen(false)
  }

  const validateForm = (): boolean => {
    const id = (formData.id ?? "").toString().trim()
    const name = (formData.name ?? "").toString().trim()
    const abbreviation = (formData.abbreviation ?? "").toString().trim()
    const prefix = (formData.prefix ?? "").toString().trim()
    const pin = (formData.pin ?? "").toString().trim()

    if (!id) {
      setError("Office ID is required")
      return false
    }
    if (!name) {
      setError("Office name is required")
      return false
    }
    if (!abbreviation) {
      setError("Abbreviation is required")
      return false
    }
    if (abbreviation.length > 3) {
      setError("Abbreviation must be 3 characters or less")
      return false
    }
    if (!prefix) {
      setError("Prefix is required")
      return false
    }
    if (prefix.length > 3) {
      setError("Prefix must be 3 characters or less")
      return false
    }
    if (!pin) {
      setError("PIN is required")
      return false
    }
    if (pin.length < 4) {
      setError("PIN must be at least 4 characters")
      return false
    }
    const countersVal = Number(formData.counters) || 1
    if (countersVal < 1 || countersVal > 6) {
      setError("Counters must be between 1 and 6")
      return false
    }
    if (isAddMode && offices.find((o: any) => o.id === id)) {
      setError("Office ID already exists")
      return false
    }
    setError("")
    return true
  }
    if (!name.trim()) {
      setError("Office name is required")
      return false
    }
    if (!abbreviation.trim()) {
      setError("Abbreviation is required")
      return false
    }
    if (abbreviation.length > 3) {
      setError("Abbreviation must be 3 characters or less")
      return false
    }
    if (!prefix.trim()) {
      setError("Prefix is required")
      return false
    }
    if (prefix.length > 3) {
      setError("Prefix must be 3 characters or less")
      return false
    }
    if (!pin.trim()) {
      setError("PIN is required")
      return false
    }
    if (pin.length < 4) {
      setError("PIN must be at least 4 characters")
      return false
    }
    if (formData.counters < 1 || formData.counters > 6) {
      setError("Counters must be between 1 and 6")
      return false
    }
    if (isAddMode && offices.find((o: any) => o.id === id)) {
      setError("Office ID already exists")
      return false
    }
    setError("")
    return true
  }

  const startAdd = () => {
    resetForm()
    setIsAddMode(true)
    setIsModalOpen(true)
  }

  const startEdit = (office: any) => {
    setFormData({
      id: office.id,
      name: office.name,
      abbreviation: office.abbreviation,
      prefix: office.prefix,
      color: office.color,
      counters: office.counters,
      pin: office.pin || "1234",
    })
    setEditingId(office.id)
    setIsAddMode(false)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      if (isAddMode) {
        const success = await addOffice(
          formData.id.trim().toLowerCase(),
          formData.name.trim(),
          formData.abbreviation.trim().toUpperCase(),
          formData.prefix.trim().toUpperCase(),
          formData.color,
          formData.counters,
          formData.pin.trim()
        )
        if (success) {
          closeModal()
          onMutate()
        } else {
          setError("Failed to add office. Office ID may already exist.")
        }
      } else if (editingId) {
        const success = await updateOffice(editingId, {
          name: formData.name.trim(),
          abbreviation: formData.abbreviation.trim().toUpperCase(),
          prefix: formData.prefix.trim().toUpperCase(),
          color: formData.color,
          counters: formData.counters,
          pin: formData.pin.trim(),
        })
        if (success) {
          closeModal()
          onMutate()
        } else {
          setError("Failed to update office.")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("[v0] Office operation error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete office ${id}? This will clear all queue data.`)) return
    setLoading(true)
    try {
      const success = await deleteOffice(id)
      if (success) {
        closeModal()
        onMutate()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Manage Offices
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-sm bg-secondary text-muted-foreground font-mono text-xs uppercase tracking-widest hover:bg-border transition-colors"
        >
          Settings
        </button>
      </div>

      {/* Offices Grid using StatCard style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {offices.map((office) => (
          <motion.div
            key={office.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setFormData({
                id: office.id,
                name: office.name,
                abbreviation: office.abbreviation,
                prefix: office.prefix,
                color: office.color,
                counters: office.counters,
                pin: "1234",
              })
              setEditingId(office.id)
              setIsModalOpen(true)
            }}
            className="flex flex-col gap-3 p-4 border border-border rounded-sm bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
          >
            {/* Color indicator */}
            <div
              className="h-2 w-full rounded-sm"
              style={{ backgroundColor: office.color }}
            />

            {/* Office info */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold text-foreground uppercase">
                {office.abbreviation}
              </span>
              <span className="font-sans text-[11px] text-muted-foreground line-clamp-2">
                {office.name}
              </span>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Queue:</span>
                <span className="font-mono text-sm" style={{ color: office.color }}>
                  {office.queueDepth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active:</span>
                <span className="font-mono text-sm text-foreground">
                  {office.activeTickets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Wait:</span>
                <span className="font-mono text-sm text-foreground">
                  {office.avgWaitMinutes}m
                </span>
              </div>
            </div>

            {/* Counter info */}
            <div className="pt-2 border-t border-border">
              <span className="font-mono text-[10px] text-muted-foreground">
                {office.totalCounters} counters • {office.idleCounters} idle
              </span>
            </div>
          </motion.div>
        ))}

        {/* Add office card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            setIsAddMode(true)
            setIsModalOpen(true)
          }}
          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-sm bg-secondary/20 hover:bg-secondary/40 transition-colors"
        >
          <span className="text-2xl text-muted-foreground">+</span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Add Office
          </span>
        </motion.button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-sm max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
                <span className="font-mono text-xs uppercase tracking-widest text-foreground">
                  {isAddMode ? "Add New Office" : "Edit Office"}
                </span>
                <button
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {error && (
                    <div className="px-3 py-2 bg-destructive/10 border border-destructive rounded-sm">
                      <span className="font-mono text-[10px] text-destructive uppercase tracking-widest">
                        {error}
                      </span>
                    </div>
                  )}

                  {/* ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Office ID
                    </label>
                    <input
                      type="text"
                      disabled={!isAddMode}
                      value={formData.id ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, id: e.target.value })
                      }
                      className="px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm disabled:opacity-50"
                      placeholder="e.g. hr"
                      required
                    />
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Office Name
                    </label>
                    <input
                      type="text"
                      value={formData.name ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm"
                      placeholder="e.g. Human Resources"
                      required
                    />
                  </div>

                  {/* Abbreviation and Prefix */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Abbreviation
                      </label>
                      <input
                        type="text"
                        value={formData.abbreviation ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            abbreviation: e.target.value.toUpperCase(),
                          })
                        }
                        maxLength={3}
                        className="px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm"
                        placeholder="HR"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Prefix
                      </label>
                      <input
                        type="text"
                        value={formData.prefix ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prefix: e.target.value.toUpperCase(),
                          })
                        }
                        maxLength={3}
                        className="px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm"
                        placeholder="HR"
                        required
                      />
                    </div>
                  </div>

                  {/* PIN and Counters */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Operator PIN
                      </label>
                      <input
                        type="text"
                        value={formData.pin ?? ""}
                        onChange={(e) =>
                          setFormData({ ...formData, pin: e.target.value })
                        }
                        className="px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm"
                        placeholder="e.g. 1234"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Counters
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={formData.counters || 2}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            counters: Math.max(1, Math.min(6, Number(e.target.value) || 1)),
                          })
                        }
                        className="px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, color: c })
                          }
                          className={`h-8 w-8 rounded-sm border-2 transition-all ${
                            formData.color === c
                              ? "border-foreground"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 rounded-sm bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Saving..." : isAddMode ? "Add Office" : "Update Office"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete "${formData.name}"?`)) {
                            setLoading(true)
                            await deleteOffice(editingId)
                            resetForm()
                            onMutate()
                            setLoading(false)
                            closeModal()
                          }
                        }}
                        disabled={loading}
                        className="px-4 py-2 rounded-sm border border-destructive text-destructive font-mono text-xs uppercase tracking-widest hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
