'use client'

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

interface GoogleButtonProps {
  clientId: string
  onSuccess: (credentialResponse: { credential?: string }) => void
  onError: () => void
}

export default function GoogleButton({ clientId, onSuccess, onError }: GoogleButtonProps) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        width="300"
      />
    </GoogleOAuthProvider>
  )
}
