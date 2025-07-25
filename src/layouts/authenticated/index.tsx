import { api } from '@convex/_generated/api'
import { useConvexAuth, useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { generatePath, Outlet, useNavigate } from 'react-router'

import { AppSidebar } from '@/components/app-sidebar/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ROUTES } from '@/lib/constants'

export function AuthenticatedLayout() {
  const user = useQuery(api.users.queries.getCurrentUser)
  const state = useConvexAuth()
  const isLoading = user === undefined || state.isLoading
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      void navigate(generatePath(ROUTES.login))
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
