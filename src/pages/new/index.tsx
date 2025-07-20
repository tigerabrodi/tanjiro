import Logo from '@/assets/logo.png'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ROUTES } from '@/lib/constants'
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import { useAction, useMutation } from 'convex/react'
import { Plus, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { generatePath, useNavigate } from 'react-router'
import { toast } from 'sonner'

const TAB_KEYS = {
  UPLOAD: 'upload',
  GENERATE: 'generate',
} as const

type TabKey = (typeof TAB_KEYS)[keyof typeof TAB_KEYS]

export function NewPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>(TAB_KEYS.UPLOAD)
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false)

  const createChatFromGeneration = useAction(
    api.chats.actions.createChatFromGeneration
  )
  const createChatFromUpload = useAction(api.chats.actions.createChatFromUpload)

  const generateUploadUrl = useMutation(api.chats.mutations.generateUploadUrl)

  const navigate = useNavigate()

  const handleTabChange = (value: TabKey) => {
    setTab(value)
  }

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  const uploadImage = async () => {
    const postUrl = await generateUploadUrl()
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': selectedFile!.type },
      body: selectedFile,
    })

    const { storageId } = (await result.json()) as { storageId: Id<'_storage'> }

    return { storageId }
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    const isUploadMode = tab === TAB_KEYS.UPLOAD
    if (isUploadMode && !selectedFile) return

    setIsSubmittingPrompt(true)

    if (isUploadMode) {
      const [uploadImageError, uploadImageResult] =
        await handlePromise(uploadImage())

      if (uploadImageError) {
        toast.error(uploadImageError.message)
        return
      }

      const storageId = uploadImageResult.storageId

      const [createChatFromUploadError, createChatFromUploadResult] =
        await handlePromise(
          createChatFromUpload({
            storageId,
            prompt,
          })
        )

      if (createChatFromUploadError) {
        toast.error(createChatFromUploadError.message)
        return
      }

      const chatId = createChatFromUploadResult.chatId

      void navigate(generatePath(ROUTES.chatDetail, { chatId }))
    } else {
      const [createChatFromGenerationError, createChatFromGenerationResult] =
        await handlePromise(
          createChatFromGeneration({
            prompt,
          })
        )

      if (createChatFromGenerationError) {
        toast.error(createChatFromGenerationError.message)
        return
      }

      const chatId = createChatFromGenerationResult.chatId

      void navigate(generatePath(ROUTES.chatDetail, { chatId }))
    }
  }

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setSelectedFile(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <img src={Logo} alt="Logo" className="mx-auto size-10" />

          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-foreground text-2xl font-semibold">
              Start Editing with AI
            </h1>

            <p className="text-muted-foreground leading-relaxed">
              Upload an image and chat with AI to make precise edits. Each
              conversation creates a linear edit history you can navigate
              through.
            </p>
          </div>
        </div>

        <Tabs
          defaultValue={tab}
          onValueChange={(value) => handleTabChange(value as TabKey)}
          className="w-full gap-7"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={TAB_KEYS.UPLOAD} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </TabsTrigger>
            <TabsTrigger value={TAB_KEYS.GENERATE} className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value={TAB_KEYS.UPLOAD} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Textarea
                placeholder="Describe what you want to do with your image... (e.g., 'Remove the background', 'Change the sky to sunset', 'Add a person wearing a red shirt')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] resize-none text-base"
                autoFocus
              />

              {selectedFile && previewUrl ? (
                <div className="border-border bg-muted/20 relative rounded-lg border-2 p-4">
                  <button
                    onClick={handleRemoveImage}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="bg-muted/10 h-48 w-full rounded-lg object-contain"
                    />
                    <div className="text-muted-foreground mx-auto flex flex-col items-center justify-center text-center text-sm">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/20 hover:bg-muted/30'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="text-muted-foreground mx-auto h-8 w-8" />
                    <div className="flex flex-col gap-1">
                      <p className="text-muted-foreground text-sm">
                        {isDragActive
                          ? 'Drop the image here...'
                          : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || !selectedFile || isSubmittingPrompt}
                className="h-12 w-full"
                size="lg"
                isLoading={isSubmittingPrompt}
                loadingText="Processing..."
              >
                Upload & Start Editing
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value={TAB_KEYS.GENERATE}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-4">
              <Textarea
                placeholder="Describe the image you want to generate... (e.g., 'A serene mountain landscape with a crystal-clear lake reflecting snow-capped peaks, surrounded by autumn trees')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] resize-none text-base"
                autoFocus
              />

              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isSubmittingPrompt}
                className="h-12 w-full"
                size="lg"
                isLoading={isSubmittingPrompt}
                loadingText="Generating..."
              >
                Generate & Start Editing
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
