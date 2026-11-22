export function getAuthErrorMessage(
  error: { message?: string; code?: string; status?: number } | null | undefined,
  fallback = 'We could not complete that request. Please try again.'
) {
  const message = error?.message?.toLowerCase() || ''
  const code = error?.code?.toLowerCase() || ''

  if (
    message.includes('invalid login credentials') ||
    code === 'invalid_credentials' ||
    code === 'invalid_grant'
  ) {
    return 'The email or password you entered is incorrect. Please try again.'
  }

  if (message.includes('email not confirmed') || code === 'email_not_confirmed') {
    return 'Please confirm your email address before signing in.'
  }

  if (
    error?.status === 429 ||
    message.includes('rate limit') ||
    message.includes('too many')
  ) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('connection')
  ) {
    return 'Unable to connect right now. Check your connection and try again.'
  }

  return fallback
}
