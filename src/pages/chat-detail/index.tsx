import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { BotIcon, UserIcon } from 'lucide-react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { ChatMessage } from './components/ChatMessage'
import { NavigationDots } from './components/NavigationDots'

export function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>()

  const detailData = useQuery(api.chats.queries.getChatDetail, {
    chatId: chatId as Id<'chats'>,
  })

  const navigateToIndex = useMutation(api.chats.mutations.navigateInChat)

  const handleNavigateToIndex = async ({ index }: { index: number }) => {
    const [error] = await handlePromise(
      navigateToIndex({
        chatId: chatId as Id<'chats'>,
        direction: index > (chat?.currentEditIndex ?? 0) ? 'forward' : 'back',
      })
    )

    if (error) {
      toast.error(error.message)
    }
  }

  const chat = detailData?.chat
  const currentEdit = detailData?.currentEdit

  return (
    <div className="container mx-auto flex h-full w-full max-w-screen-2xl flex-col items-center gap-4 p-4">
      <div className="bg-card border-border h-[50vh] w-full rounded-2xl border p-2">
        <img
          src={currentEdit?.outputImageUrl ?? ''}
          alt={currentEdit?.aiResponseText}
          className="h-full w-full rounded-lg object-cover"
        />
      </div>

      <div className="flex w-[600px] flex-col">
        <div className="bg-card border-border w-full rounded-t-lg border py-2">
          <NavigationDots
            totalEdits={chat?.editHistory.length ?? 0}
            currentIndex={chat?.currentEditIndex ?? 0}
            onNavigate={handleNavigateToIndex}
          />
        </div>

        <div className="bg-card border-border flex w-full flex-col gap-2 rounded-b-lg border-x border-b px-4 py-5">
          <div className="mx-auto flex w-fit flex-col gap-4">
            <ChatMessage
              icon={<UserIcon className="size-3" />}
              label="You"
              text={currentEdit?.userPrompt ?? ''}
              iconContainerClassName="bg-muted text-muted-foreground"
            />
            <ChatMessage
              icon={<BotIcon className="size-3" />}
              label="AI"
              text={currentEdit?.aiResponseText ?? ''}
              iconContainerClassName="bg-primary text-primary-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
