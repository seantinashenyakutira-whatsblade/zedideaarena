import { redirect } from 'next/navigation'

export default async function ContestantPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const path = slug?.join('/') || ''
  redirect(`/dashboard${path ? `/${path}` : ''}`)
}
