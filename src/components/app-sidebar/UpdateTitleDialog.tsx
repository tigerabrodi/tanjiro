import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { handlePromise } from '@/lib/utils'

interface UpdateTitleDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  chatId: Id<'chats'> | null
  currentTitle: string
}

export function UpdateTitleDialog({
  isOpen,
  setIsOpen,
  chatId,
  currentTitle,
}: UpdateTitleDialogProps) {
  const [title, setTitle] = useState(currentTitle)
  const [isSaving, setIsSaving] = useState(false)

  const updateChatTitle = useMutation(api.chats.mutations.updateChatTitle)

  const handleSave = async () => {
    if (!chatId) {
      throw new Error('Chat ID is required - something went terribly wrong')
    }

    if (!title.trim()) {
      toast.error('Title cannot be empty')
      return
    }

    setIsSaving(true)

    const [error] = await handlePromise(
      updateChatTitle({
        chatId: chatId,
        title: title.trim(),
      })
    )

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Title updated successfully')
    setIsOpen(false)
    setIsSaving(false)
  }

  const handleCancel = () => {
    setTitle(currentTitle)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chat title..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleSave()
                }
                if (e.key === 'Escape') {
                  handleCancel()
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving}
            loadingText="Saving..."
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
