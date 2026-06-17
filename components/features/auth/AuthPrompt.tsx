'use client'

import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import AuthPromptContent from './AuthPromptContent'
import AuthPromptActions from './AuthPromptActions'

interface AuthPromptProps {
  onClose?: () => void
}

export default function AuthPrompt({ onClose }: AuthPromptProps) {
  const router = useRouter()

  function handleClose() {
    if (onClose) onClose()
    else router.back()
  }

  return (
    <Modal open onClose={handleClose}>
      <AuthPromptContent />
      <AuthPromptActions
        onLogin={() => router.push('/profile')}
        onBack={handleClose}
      />
    </Modal>
  )
}
