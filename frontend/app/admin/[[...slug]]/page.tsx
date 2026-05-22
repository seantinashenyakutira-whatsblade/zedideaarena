import { redirect } from 'next/navigation'

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const path = slug?.join('/') || ''
  if (path === 'dashboard') {
    redirect('/dashboard/admin')
  }
  redirect(`/dashboard/admin${path ? `/${path}` : ''}`)
}
