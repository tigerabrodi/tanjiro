import { useParams } from 'react-router'

export function ChatDetailPage() {
  const { chatId } = useParams<{ chatId: string }>()

  console.log(chatId)

  return <div>ChatDetailPage</div>
}
