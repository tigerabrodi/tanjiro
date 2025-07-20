import WandImg from '@/assets/wand.png'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ROUTES } from '@/lib/constants'
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { useAction, useMutation, useQuery } from 'convex/react'
import { BotIcon, UserIcon } from 'lucide-react'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { generatePath, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { BranchingDialog } from './components/BranchingDialog'
import { ChatMessage } from './components/ChatMessage'
import { NavigationDots } from './components/NavigationDots'

export const NEVER_SHOW_BRANCHING_DIALOG_KEY =
  'tanjiro-never-show-branching-dialog'

export function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAcceptedBranching, setHasAcceptedBranching] = useState(false)
  const [isBranchingDialogOpen, setIsBranchingDialogOpen] = useState(false)

  const navigate = useNavigate()

  const detailData = useQuery(api.chats.queries.getChatDetail, {
    chatId: chatId as Id<'chats'>,
  })

  const chat = detailData?.chat
  const isOnLatest = detailData?.metadata.isOnLatest
  const currentEdit = detailData?.currentEdit

  const addEditToChat = useAction(api.chats.actions.addEditToChat)
  const navigateToIndex = useMutation(api.chats.mutations.navigateInChat)

  // Cmd+Enter hotkey for auto-submission
  useHotkeys(
    'meta+enter',
    (e) => {
      e.preventDefault()
      if (prompt.trim() && !isSubmitting) {
        void handleSubmit()
      }
    },
    { enableOnFormTags: true }
  )

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

  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return

    const shouldNeverShowAgain =
      localStorage.getItem(NEVER_SHOW_BRANCHING_DIALOG_KEY) === 'true'

    // If not on latest and haven't accepted branching for this session and haven't set "never show again"
    if (!isOnLatest && !hasAcceptedBranching && !shouldNeverShowAgain) {
      setIsBranchingDialogOpen(true)
      return
    }

    await submitEdit()
  }

  const handleBranchingConfirm = (neverShowAgain: boolean) => {
    if (neverShowAgain) {
      localStorage.setItem(NEVER_SHOW_BRANCHING_DIALOG_KEY, 'true')
    }
    setHasAcceptedBranching(true)
  }

  const submitEdit = async () => {
    if (!prompt.trim()) return

    setIsSubmitting(true)

    const [error, result] = await handlePromise(
      addEditToChat({
        chatId: chatId as Id<'chats'>,
        prompt: prompt.trim(),
      })
    )

    if (error) {
      toast.error(error.message)
      setIsSubmitting(false)
      return
    }

    if (result?.isNewChat) {
      void navigate(generatePath(ROUTES.chatDetail, { chatId: result.chatId }))
    }

    setPrompt('')
    setIsSubmitting(false)
    setHasAcceptedBranching(false)
  }

  return (
    <>
      <div className="container mx-auto flex h-full w-full max-w-screen-2xl flex-col items-center gap-4 p-8">
        <div className="bg-card border-border h-[50vh] w-full max-w-[800px] rounded-2xl border p-2">
          <img
            src={currentEdit?.outputImageUrl ?? ''}
            alt={currentEdit?.aiResponseText}
            className="h-full w-full rounded-lg object-cover"
          />
        </div>

        <div className="flex w-full max-w-[600px] flex-col">
          <div className="bg-card border-border w-full rounded-t-lg border py-2">
            <NavigationDots
              totalEdits={chat?.editHistory.length ?? 0}
              currentIndex={chat?.currentEditIndex ?? 0}
              onNavigate={handleNavigateToIndex}
            />
          </div>

          <div className="bg-card border-border flex max-h-[180px] w-full flex-col gap-2 rounded-b-lg border-x border-b px-4 py-5">
            <div className="mx-auto flex w-fit flex-col gap-4">
              <ChatMessage
                icon={<UserIcon className="size-3" />}
                label="You"
                text={currentEdit?.userPrompt ?? ''}
                iconContainerClassName="bg-muted text-muted-foreground"
                shouldShowTooltip={false}
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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
          className="flex w-full max-w-[600px] items-center gap-2"
        >
          <Textarea
            placeholder={
              isOnLatest
                ? "Describe how you'd like to edit this image..."
                : 'Branch from this edit...'
            }
            className="max-h-[42px] min-h-[38px] flex-1 resize-none text-xs md:text-xs"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isSubmitting}
          />

          <div className="h-full py-2.5">
            <Button
              type="submit"
              className="h-8 rounded-sm px-4 text-xs"
              disabled={!prompt.trim() || isSubmitting}
            >
              {isSubmitting ? 'Generating...' : 'Generate'}
              <img src={WandImg} alt="Wand" className="size-4" />
            </Button>
          </div>
        </form>
      </div>

      <BranchingDialog
        isOpen={isBranchingDialogOpen}
        setIsOpen={setIsBranchingDialogOpen}
        onConfirm={handleBranchingConfirm}
      />
    </>
  )
}
