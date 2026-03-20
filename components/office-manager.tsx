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

interface OfficeManagerProps {
  offices: any[]
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
    const id = formData.id || ""
    const name = formData.name || ""
    const abbreviation = formData.abbreviation || ""
    const prefix = formData.prefix || ""
    const pin = formData.pin || ""

    if (!id.trim()) {
      setError("Office ID is required")
      return false
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
    <>
      {/* Offices List Header */}
      <div className="border border-border rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-secondary">
          <span className="font-mono text-xs uppercase tracking-widest text-foreground">
            Offices ({offices.length})
          </span>
          <button
            onClick={startAdd}
            className="px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity"
          >
            + Add
          </button>
        </div>

        {/* Offices Grid */}
        <div className="p-4 bg-secondary/50 grid grid-cols-1 md:grid-cols-2 gap-3">
          {offices && offices.length > 0 ? (
            offices.map((office) => (
              <div
                key={office.id}
                className="flex flex-col gap-2 p-3 bg-background border border-border rounded-sm hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: office.color }}
                    />
                    <div>
                      <span className="font-mono text-sm text-foreground block">
                        {office.abbreviation}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {office.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-muted-foreground">
                    {office.counters} counters
                  </span>
                  <button
                    onClick={() => startEdit(office)}
                    className="px-2 py-1 bg-secondary border border-border rounded-sm font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-border transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6">
              <span className="font-mono text-[10px] text-muted-foreground">
                No offices yet. Add one to get started.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-background border border-border rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
                  <h2 className="font-mono text-sm uppercase tracking-widest text-foreground">
                    {isAddMode ? "Add Office" : "Edit Office"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                  {/* Error Message */}
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
                    <div className="flex gap-2 flex-wrap">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`h-8 w-8 rounded-sm border-2 transition-all ${
                            formData.color === color
                              ? "border-foreground scale-110"
                              : "border-border"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? "..." : isAddMode ? "Add Office" : "Update"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(editingId)}
                        disabled={loading}
                        className="px-4 py-2 border border-destructive text-destructive font-mono text-xs uppercase tracking-widest rounded-sm hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
