"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getOrgIdFromSlug, getStoredOffices } from "@/lib/actions"
import { getOperators, addOperator, updateOperator, deleteOperator } from "@/lib/operator-actions"
import AdminSidebar from "@/components/admin-sidebar"
import { X } from "lucide-react"

export default function OperatorsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [orgId, setOrgId] = useState("")
  const [operators, setOperators] = useState<any[]>([])
  const [offices, setOffices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ email: "", office_id: "", pin: "" })

  const loadData = async () => {
    const oid = await getOrgIdFromSlug(slug)
    setOrgId(oid)
    const [ops, offs] = await Promise.all([getOperators(oid), getStoredOffices(oid)])
    setOperators(ops)
    setOffices(offs)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [slug])

  const resetForm = () => {
    setFormData({ email: "", office_id: offices[0]?.id || "", pin: "" })
    setEditingId(null)
    setIsAddMode(false)
    setError("")
  }

  const startAdd = () => { resetForm(); setIsAddMode(true); setIsModalOpen(true) }
  const startEdit = (op: any) => {
    setFormData({ email: op.email, office_id: op.office_id, pin: op.pin })
    setEditingId(op.id)
    setIsAddMode(false)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      if (isAddMode) {
        console.log("Adding operator with data:", formData, "for orgId:", orgId)
        await addOperator(orgId, formData.email, formData.office_id, formData.pin)
      } else if (editingId) {
        await updateOperator(editingId, { email: formData.email, office_id: formData.office_id, pin: formData.pin })
      }
      setIsModalOpen(false)
      loadData()
    } catch (err: any) {
      setError(err?.message || "An error occurred")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this operator?")) return
    try {
      await deleteOperator(id)
      loadData()
    } catch (err: any) {
      setError(err?.message || "Failed to delete operator")
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
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Operators</span>
          <button onClick={startAdd} className="px-3 py-1.5 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity">
            Add Operator
          </button>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {error && (
              <div className="px-4 py-3 border border-destructive/50 bg-destructive/10 rounded-sm">
                <p className="font-mono text-xs text-destructive">{error}</p>
              </div>
            )}
            {operators.map((op) => (
              <div key={op.id} className="flex items-center justify-between px-4 py-3 border border-border rounded-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-foreground">{op.email}</span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    {offices.find(o => o.id === op.office_id)?.abbreviation || op.office_id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(op)} className="px-2 py-1 rounded-sm border border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(op.id)} className="px-2 py-1 rounded-sm border border-border font-mono text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {operators.length === 0 && (
              <div className="text-center py-12">
                <span className="font-mono text-xs text-muted-foreground">No operators configured yet.</span>
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-sm max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-mono text-sm uppercase tracking-widest text-foreground">
                {isAddMode ? "Add Operator" : "Edit Operator"}
              </h2>
              <button onClick={() => { setIsModalOpen(false); resetForm() }}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Office</label>
                <select value={formData.office_id} onChange={(e) => setFormData({ ...formData, office_id: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground">
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.abbreviation})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">PIN</label>
                <input value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground" required />
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
