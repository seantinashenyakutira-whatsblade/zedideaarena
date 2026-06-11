'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, Loader2, ShieldCheck, Eye, Filter, Trash2, Ban } from 'lucide-react'
import { adminService } from '@/services/core'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminUsers() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUnverified, setShowUnverified] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await adminService.getAllUsers(showUnverified || undefined)
      setUsers(res.data || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!profile?.is_admin && profile?.role !== 'admin') return
    fetchUsers()
  }, [profile, showUnverified])

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      await adminService.verifyUser(userId, isVerified)
      toast.success(`User ${isVerified ? 'verified' : 'unverified'}`)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Ban/delete "${name}"? This will remove their access permanently.`)) return
    try {
      await adminService.deleteUser(userId)
      toast.success('User banned/deleted')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user')
    }
  }

  if (!profile?.is_admin && profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-black">Access Denied</h1>
          <p className="text-zed-foreground-secondary">You do not have admin privileges.</p>
          <Link href="/dashboard" className="btn-primary mt-6 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-zed-foreground">User Management</h1>
          <p className="text-zed-foreground-secondary text-xs font-bold uppercase tracking-widest mt-1">{users.length} users</p>
        </div>
        <button
          onClick={() => setShowUnverified(!showUnverified)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showUnverified ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-zed-foreground-secondary hover:bg-white/10 border border-transparent'}`}
        >
          <Filter size={14} /> {showUnverified ? 'Showing Unverified Only' : 'Show Unverified Only'}
        </button>
      </div>

      <div className="card-zed overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 text-left text-[10px] font-black uppercase tracking-widest text-zed-foreground-secondary">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Voter Status</th>
                <th className="p-4">Country</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
                <th className="p-4">Ban</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={9} className="p-12 text-center"><Loader2 size={32} className="animate-spin mx-auto opacity-20" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="p-12 text-center text-zed-foreground-secondary text-sm">No users found</td></tr>
              ) : users.map((user: any) => (
                <tr key={user.id} className={`hover:bg-white/5 transition-colors ${user.is_banned || user.is_deleted ? 'opacity-40' : ''}`}>
                  <td className="p-4 font-bold text-sm">{user.full_name || 'N/A'}</td>
                  <td className="p-4 text-xs text-zed-foreground-secondary">{user.email || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : user.role === 'voter' ? 'bg-zed-accent/20 text-zed-accent' : 'bg-zed-primary/20 text-zed-primary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${user.is_verified ? 'bg-zed-success/20 text-zed-success' : 'bg-red-500/20 text-red-400'}`}>
                      {user.is_verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${user.voter_payment_status === 'paid' ? 'bg-zed-success/20 text-zed-success' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {user.voter_payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-zed-foreground-secondary">{user.country || '—'}</td>
                  <td className="p-4 text-xs text-zed-foreground-secondary">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/users/${user.id}`} className="btn-icon w-8 h-8"><Eye size={14} /></Link>
                      <button
                        onClick={() => handleVerifyUser(user.id, !user.is_verified)}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg transition-all ${user.is_verified ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-zed-success/10 text-zed-success hover:bg-zed-success/20'}`}
                      >
                        <ShieldCheck size={14} />
                        {user.is_verified ? 'Revoke' : 'Verify'}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.full_name)}
                      className="btn-icon w-8 h-8 text-red-400 hover:bg-red-500/10"
                      title="Ban/Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
