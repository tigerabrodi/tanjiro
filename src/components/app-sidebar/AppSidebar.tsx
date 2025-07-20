import { api } from '@convex/_generated/api'
import type { Doc, Id } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { MoreHorizontal, Plus, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { generatePath, Link, NavLink, useParams } from 'react-router'

import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'

import { SettingsDialog } from './SettingsDialog'
import { UpdateTitleDialog } from './UpdateTitleDialog'

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
import { usePrefetchQuery } from '@/hooks/usePrefetchQuery'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const chats = useQuery(api.chats.queries.getUserChats)
  const prefetchChatDetail = usePrefetchQuery(api.chats.queries.getChatDetail)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { chatId } = useParams<{ chatId: Id<'chats'> }>()
  const [titleDialogState, setTitleDialogState] = useState<{
    isOpen: boolean
    chatId: Id<'chats'> | null
    currentTitle: string
  }>({
    isOpen: false,
    chatId: null,
    currentTitle: '',
  })

  const isFetchingChats = chats === undefined

  useEffect(() => {
    if (chats) {
      chats.forEach((chat) => {
        prefetchChatDetail({ chatId: chat._id })
      })
    }
  }, [chats, prefetchChatDetail])

  return (
    <>
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
          {isFetchingChats ? (
            <ChatListSkeleton />
          ) : chats && chats.length > 0 ? (
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground mb-2 pl-3 text-sm font-medium">
                Recent Chats
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-1">
                  {chats.map((chat) => (
                    <ChatItem
                      key={chat._id}
                      chat={chat}
                      isActive={chat._id === chatId}
                      onRename={({ chatId, currentTitle }) => {
                        setTitleDialogState({
                          isOpen: true,
                          chatId,
                          currentTitle,
                        })
                      }}
                    />
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
        <SidebarFooter>
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />

      <UpdateTitleDialog
        isOpen={titleDialogState.isOpen}
        setIsOpen={(isOpen) =>
          setTitleDialogState((prev) => ({ ...prev, isOpen }))
        }
        chatId={titleDialogState.chatId}
        currentTitle={titleDialogState.currentTitle}
      />
    </>
  )
}

function ChatListSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground mb-2 pl-3 text-sm font-medium">
        Recent Chats
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="flex flex-col gap-1">
          {Array.from({ length: 3 }, (_, index) => (
            <SidebarMenuItem key={index}>
              <div className="flex items-center justify-between rounded-lg p-3">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-2 w-4 rounded" />
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function ChatItem({
  chat,
  onRename,
  isActive,
}: {
  chat: Doc<'chats'>
  onRename: (params: { chatId: Id<'chats'>; currentTitle: string }) => void
  isActive: boolean
}) {
  return (
    <SidebarMenuItem key={chat._id}>
      <SidebarMenuButton asChild>
        <NavLink
          to={generatePath(ROUTES.chatDetail, { chatId: chat._id })}
          className={cn(
            'flex items-center justify-between rounded-lg p-3 transition-colors',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
          )}
        >
          <p className="truncate text-sm font-medium">{chat.title}</p>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-3 w-3" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  onRename({ chatId: chat._id, currentTitle: chat.title })
                }
              >
                Rename
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
