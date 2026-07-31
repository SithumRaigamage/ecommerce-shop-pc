export interface User {
  email: string
  password: string
}

/**
 * Port of the dummy authentication the Angular navbar did inline: it hardcoded a
 * user and checked the credentials against themselves, so it was always "logged in".
 * Behaviour is unchanged — this just isolates the seam for a real auth backend.
 */
const DEMO_USER: User = { email: 'test@gmail.com', password: 'test123' }

export function useAuth() {
  const isLoggedIn =
    DEMO_USER.email === 'test@gmail.com' && DEMO_USER.password === 'test123'

  return { isLoggedIn, user: isLoggedIn ? DEMO_USER : undefined }
}
