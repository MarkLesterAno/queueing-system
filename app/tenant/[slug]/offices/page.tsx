"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getOrgIdFromSlug, getStoredOffices, addOffice, updateOffice, deleteOffice, setOfficeCounters, resetOfficeQueue } from "@/lib/actions"
import AdminSidebar from "@/components/admin-sidebar"
import { X } from "lucide-react"

const DEFAULT_COLORS = [
  "#5B8C6A", "#C4845C", "#7A8CBE", "#B57B9E",
  "#8B9E6B", "#9E8B6B", "#6B8B9E", "#8B6B6B",
]

export default function OfficesPage() {
  const params = useParams()
  const slug = params.slug as string
  const [orgId, setOrgId] = useState<string>("")
  const [offices, setOffices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    id: "", name: "", abbreviation: "", prefix: "", color: DEFAULT_COLORS[0], counters: 1,
  })

  const loadData = async () => {
    const oid = await getOrgIdFromSlug(slug)
    setOrgId(oid)
    const offices = await getStoredOffices(oid)
    setOffices(offices)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [slug])
  const resetForm = () => {
    setFormData({ id: "", name: "", abbreviation: "", prefix: "", color: DEFAULT_COLORS[0], counters: 1 })
    setEditingId(null)
    setIsAddMode(false)
    setError("")
  }

  const startAdd = () => { resetForm(); setIsAddMode(true); setIsModalOpen(true) }
  const startEdit = (office: any) => {
    setFormData({
      id: office.id, name: office.name, abbreviation: office.abbreviation,
      prefix: office.prefix, color: office.color, counters: office.totalCounters || office.counters,
    })
    setEditingId(office.id)
    setIsAddMode(false)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const oid = await getOrgIdFromSlug(slug)
      if (isAddMode) {
        await addOffice(orgId, formData.id.toLowerCase(), formData.name, formData.abbreviation.toUpperCase(), formData.prefix.toUpperCase(), formData.color, formData.counters)
      } else if (editingId) {
        await updateOffice(orgId, editingId, {
          name: formData.name, abbreviation: formData.abbreviation.toUpperCase(),
          prefix: formData.prefix.toUpperCase(), color: formData.color, counters: formData.counters,
        })
      }
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      setError(err?.message || "An error occurred")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete office ${id}?`)) return
    try {
      await deleteOffice(orgId, id)
      loadData()
    } catch (err: any) {
      setError(err?.message || "Failed to delete office")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Offices</span>
          <button onClick={startAdd} className="px-3 py-1.5 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity">
            Add Office
          </button>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {error && (
              <div className="px-4 py-3 border border-destructive/50 bg-destructive/10 rounded-sm">
                <p className="font-mono text-xs text-destructive">{error}</p>
              </div>
            )}
            {offices.map((office) => (
              <div key={office.id} className="flex items-center justify-between px-4 py-3 border border-border rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: office.color }} />
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground">{office.abbreviation}</span>
                  <span className="font-sans text-sm text-muted-foreground">{office.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{office.counters} counters</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(office)} className="px-2 py-1 rounded-sm border border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(office.id)} className="px-2 py-1 rounded-sm border border-border font-mono text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {offices.length === 0 && (
              <div className="text-center py-12">
                <span className="font-mono text-xs text-muted-foreground">No offices configured yet.</span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-sm max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-mono text-sm uppercase tracking-widest text-foreground">
                {isAddMode ? "Add Office" : "Edit Office"}
              </h2>
              <button onClick={() => { setIsModalOpen(false); resetForm() }}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {isAddMode && (
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ID</label>
                  <input value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground" required />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Name</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Abbreviation</label>
                  <input value={formData.abbreviation} onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground" required maxLength={3} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Prefix</label>
                  <input value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground" required maxLength={3} />
                </div>
              </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Counters</label>
                  <input type="number" min={1} max={6} value={formData.counters} onChange={(e) => setFormData({ ...formData, counters: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground" />
                </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Color</label>
                <div className="flex gap-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                      className={`h-8 w-8 rounded-sm border ${formData.color === c ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-destructive font-mono">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm() }}
                  className="flex-1 py-2 bg-secondary text-muted-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:bg-border transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity">
                  {isAddMode ? "Add" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
