import Logo from '@/assets/logo.png'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/lib/constants'
import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex flex-col gap-6">
          <div className="text-primary flex items-center justify-center gap-2 text-lg font-bold">
            <img src={Logo} alt="Tanjiro" className="size-6" />
            Tanjaro
          </div>

          <Button asChild className="justify-between gap-1 font-medium">
            <Link to={ROUTES.new}>
              New chat
              <Plus className="h-4 w-4" strokeWidth={3} />
            </Link>
          </Button>
        </div>
        <Separator className="my-2" />
      </SidebarHeader>
      <SidebarContent>content</SidebarContent>
      <SidebarFooter>footer</SidebarFooter>
    </Sidebar>
  )
}
