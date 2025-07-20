import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface BranchingDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: (neverShowAgain: boolean) => void
}

export function BranchingDialog({
  isOpen,
  setIsOpen,
  onConfirm,
}: BranchingDialogProps) {
  const [shouldNeverShowAgain, setShouldNeverShowAgain] = useState(false)

  const handleConfirm = () => {
    onConfirm(shouldNeverShowAgain)
    setIsOpen(false)
    setShouldNeverShowAgain(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setShouldNeverShowAgain(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Branch?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;re not on the latest edit. This will create a new chat
            branching from this point, allowing you to explore a different
            direction while preserving your original edit history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                className="bg-card border-2"
                id="never-show-again"
                checked={shouldNeverShowAgain}
                onCheckedChange={(checked) =>
                  setShouldNeverShowAgain(checked as boolean)
                }
              />
              <Label htmlFor="never-show-again" className="text-sm">
                Don&apos;t show this dialog again for any chats
              </Label>
            </div>
            <div className="ml-auto flex gap-2">
              <AlertDialogCancel onClick={handleCancel}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Create Branch
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
