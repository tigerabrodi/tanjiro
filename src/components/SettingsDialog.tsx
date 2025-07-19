import { InputWithFeedback } from '@/components/InputWithFeedback'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { CustomConvexError } from '@convex/error'
import { useAction } from 'convex/react'
import { Eye, EyeOff } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'

type FormState = {
  status: 'error' | 'success' | 'idle'
}

interface SettingsDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function SettingsDialog({ isOpen, setIsOpen }: SettingsDialogProps) {
  const [geminiKey, setGeminiKey] = useState('')
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [isLoadingGeminiKey, setIsLoadingGeminiKey] = useState(true)

  const storeGeminiApiKey = useAction(api.users.actions.storeGeminiApiKey)
  const getGeminiApiKey = useAction(api.users.actions.getGeminiApiKey)

  useEffect(() => {
    if (isOpen) {
      getGeminiApiKey()
        .then((key) => {
          setGeminiKey(key || '')
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          setIsLoadingGeminiKey(false)
        })
    }
  }, [isOpen, getGeminiApiKey])

  const [, formAction, isSaving] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const geminiKey = formData.get('geminiApiKey') as string

      if (!geminiKey) {
        toast.error('Please enter your Gemini API key')
        return { status: 'error' }
      }

      const [geminiError] = await handlePromise(
        storeGeminiApiKey({ apiKey: geminiKey })
      )

      if (geminiError) {
        if (geminiError instanceof CustomConvexError) {
          toast.error(geminiError.data)
        } else {
          toast.error('Failed to store Gemini API key')
        }

        return { status: 'error' }
      }

      toast.success('API key saved successfully')
      setIsOpen(false)
      return { status: 'success' }
    },
    { status: 'idle' }
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-6" action={formAction}>
          <div>
            <h2 className="mb-2 text-xl font-bold">API Keys</h2>
            <p className="text-muted-foreground">
              Provide your Gemini API key to enable image editing
            </p>
          </div>

          <Card className="pb-6">
            <CardHeader>
              <CardTitle>Gemini API Key</CardTitle>
              <CardDescription>
                Required for AI-powered image editing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="gemini-key">API Key</Label>
                  <div className="mt-1">
                    <InputWithFeedback
                      id="gemini-key"
                      name="geminiApiKey"
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKey}
                      required
                      disabled={isLoadingGeminiKey}
                      isLoading={isLoadingGeminiKey}
                      onChange={(event) => setGeminiKey(event.target.value)}
                      placeholder="AIza..."
                      trailingElement={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setShowGeminiKey((prev) => !prev)}
                        >
                          {showGeminiKey ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                          <span className="sr-only">
                            {showGeminiKey ? 'Hide' : 'Show'} API Key
                          </span>
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            disabled={isSaving}
            type="submit"
            className="w-full"
            isLoading={isSaving}
            loadingText="Saving..."
          >
            Save API Key
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
