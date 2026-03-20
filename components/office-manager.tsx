"use client"

import { useState } from "react"
import { addOffice, updateOffice, deleteOffice } from "@/lib/actions"
import { ChevronDown, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface OfficeFormData {
  id: string
  name: string
  abbreviation: string
  prefix: string
  color: string
  counters: number
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
  const [isOpen, setIsOpen] = useState(false)
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
  })

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      abbreviation: "",
      prefix: "",
      color: DEFAULT_COLORS[0],
      counters: 2,
    })
    setEditingId(null)
    setIsAddMode(false)
    setError("")
  }

  const validateForm = (): boolean => {
    if (!formData.id.trim()) {
      setError("Office ID is required")
      return false
    }
    if (!formData.name.trim()) {
      setError("Office name is required")
      return false
    }
    if (!formData.abbreviation.trim()) {
      setError("Abbreviation is required")
      return false
    }
    if (formData.abbreviation.length > 3) {
      setError("Abbreviation must be 3 characters or less")
      return false
    }
    if (!formData.prefix.trim()) {
      setError("Prefix is required")
      return false
    }
    if (formData.prefix.length > 3) {
      setError("Prefix must be 3 characters or less")
      return false
    }
    if (formData.counters < 1 || formData.counters > 6) {
      setError("Counters must be between 1 and 6")
      return false
    }
    if (isAddMode && offices.find((o: any) => o.id === formData.id)) {
      setError("Office ID already exists")
      return false
    }
    setError("")
    return true
  }

  const startAdd = () => {
    resetForm()
    setIsAddMode(true)
  }

  const startEdit = (office: any) => {
    setFormData({
      id: office.id,
      name: office.name,
      abbreviation: office.abbreviation,
      prefix: office.prefix,
      color: office.color,
      counters: office.counters,
    })
    setEditingId(office.id)
    setIsAddMode(false)
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
          formData.counters
        )
        if (success) {
          resetForm()
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
        })
        if (success) {
          resetForm()
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
        resetForm()
        onMutate()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary border-b border-border hover:bg-border transition-colors"
      >
        <span className="font-mono text-xs uppercase tracking-widest text-foreground">
          Office Management
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-secondary/50 flex flex-col gap-4">
              {/* Form Section */}
              {(isAddMode || editingId) && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 pb-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {isAddMode ? "Add New Office" : "Edit Office"}
                    </span>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {error && (
                    <div className="px-2 py-1.5 bg-destructive/10 border border-destructive rounded-sm">
                      <span className="font-mono text-[10px] text-destructive uppercase tracking-widest">
                        {error}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {/* ID - readonly when editing */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        ID
                      </label>
                      <input
                        type="text"
                        disabled={!isAddMode}
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        className="px-2 py-1.5 bg-background border border-border rounded-sm font-mono text-xs disabled:opacity-50"
                        placeholder="e.g. hr"
                        required
                      />
                    </div>

                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="px-2 py-1.5 bg-background border border-border rounded-sm font-mono text-xs"
                        placeholder="e.g. Human Resources"
                        required
                      />
                    </div>

                    {/* Abbreviation */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Abbreviation
                      </label>
                      <input
                        type="text"
                        value={formData.abbreviation}
                        onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value.toUpperCase() })}
                        maxLength={3}
                        className="px-2 py-1.5 bg-background border border-border rounded-sm font-mono text-xs"
                        placeholder="e.g. HR"
                        required
                      />
                    </div>

                    {/* Prefix */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Prefix
                      </label>
                      <input
                        type="text"
                        value={formData.prefix}
                        onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                        maxLength={3}
                        className="px-2 py-1.5 bg-background border border-border rounded-sm font-mono text-xs"
                        placeholder="e.g. HR"
                        required
                      />
                    </div>

                    {/* Color */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Color
                      </label>
                      <div className="flex gap-1 flex-wrap">
                        {DEFAULT_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`h-6 w-6 rounded-sm border-2 transition-all ${
                              formData.color === color ? "border-foreground" : "border-border"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Counters */}
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Counters
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={formData.counters}
                        onChange={(e) => setFormData({ ...formData, counters: Number(e.target.value) })}
                        className="px-2 py-1.5 bg-background border border-border rounded-sm font-mono text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? "..." : isAddMode ? "Add Office" : "Update Office"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(editingId)}
                        disabled={loading}
                        className="px-3 py-1.5 border border-destructive text-destructive font-mono text-xs uppercase tracking-widest rounded-sm hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Offices List */}
              <div className="flex flex-col gap-2">
                {offices && offices.length > 0 ? (
                  offices.map((office) => (
                    <div
                      key={office.id}
                      className="flex items-center justify-between px-3 py-2 bg-background border border-border rounded-sm hover:border-border/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: office.color }}
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs text-foreground">
                            {office.abbreviation}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {office.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {office.counters} counters
                        </span>
                        <button
                          onClick={() => startEdit(office)}
                          className="px-2 py-1 text-[10px] bg-secondary border border-border rounded-sm font-mono uppercase tracking-widest text-muted-foreground hover:bg-border transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground text-center py-2">
                    No offices found
                  </span>
                )}
              </div>

              {/* Add button */}
              {!isAddMode && !editingId && (
                <button
                  onClick={startAdd}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm font-mono text-xs uppercase tracking-widest text-foreground hover:bg-secondary transition-colors"
                >
                  + Add Office
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
