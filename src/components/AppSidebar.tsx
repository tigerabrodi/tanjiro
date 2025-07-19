import Logo from '@/assets/logo.png'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import type { Doc } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Plus } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

export function AppSidebar() {
  const chats = useQuery(api.chats.queries.getUserChats)

  return (
    <Sidebar className="p-4">
      <SidebarHeader>
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
      <SidebarContent>
        {chats && chats.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground mb-2 pl-3 text-sm font-medium">
              Recent Chats
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1">
                {chats.map((chat) => (
                  <ChatItem key={chat._id} chat={chat} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <p className="mx-auto text-sm font-medium">No chats yet</p>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>footer</SidebarFooter>
    </Sidebar>
  )
}

function ChatItem({ chat }: { chat: Doc<'chats'> }) {
  return (
    <SidebarMenuItem key={chat._id}>
      <SidebarMenuButton asChild>
        <NavLink
          to={`/chat/${chat._id}`}
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-lg p-3 transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
            )
          }
        >
          <p className="truncate text-sm font-medium">{chat.title}</p>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
