import { useState } from 'react'
import { LogIn, LogOut, UserPlus, Trash2 } from 'lucide-react'
import { useUserStore } from '../store/userStore'
import styles from './Settings.module.css'

function AccountSection() {
  const currentUser = useUserStore((s) => s.currentUser)
  const setCurrentUser = useUserStore((s) => s.setCurrentUser)

  // Sign-in fields
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Create fields
  const [fName, setFName] = useState('')
  const [lName, setLName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function clearMessages() {
    setError(null)
    setSuccess(null)
  }

  async function handleSignIn() {
    clearMessages()
    if (!signInEmail.trim()) { setError('Email is required.'); return }
    if (!signInPassword) { setError('Password is required.'); return }
    try {
      const user = await window.user?.signIn(signInEmail.trim(), signInPassword)
      if (!user) { setError('No account found with that email.'); return }
      setCurrentUser(user)
      setSignInEmail('')
      setSignInPassword('')
      setSuccess(`Signed in as ${[user.fName, user.lName].filter(Boolean).join(' ') || 'User'}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    }
  }

  async function handleCreate() {
    clearMessages()
    if (!fName.trim()) { setError('First name is required.'); return }
    if (!createEmail.trim()) { setError('Email is required.'); return }
    if (!createPassword) { setError('Password is required.'); return }
    if (createPassword !== confirmPassword) { setError('Passwords do not match.'); return }

    const user = await window.user?.create({
      fName: fName.trim(),
      lName: lName.trim() || null,
      email: createEmail.trim(),
      password: createPassword,
    })
    if (user) {
      setCurrentUser(user)
      setFName(''); setLName(''); setCreateEmail(''); setCreatePassword(''); setConfirmPassword('')
      setSuccess(`Account created. Signed in as ${user.fName}.`)
    }
  }

  function handleSignOut() {
    clearMessages()
    setConfirmDelete(false)
    setCurrentUser(null)
    setSuccess('Signed out.')
  }

  async function handleDelete() {
    clearMessages()
    if (!currentUser) return
    setCurrentUser(null)
    await window.user?.delete(currentUser.userId)
    setConfirmDelete(false)
    setSuccess('Account deleted.')
  }

  const displayName = [currentUser?.fName, currentUser?.lName].filter(Boolean).join(' ') || 'User'

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Account</h2>
        <p className={styles.cardDescription}>
          Create and switch between user accounts on this device.
        </p>
      </div>

      <hr className={styles.divider} />

      {currentUser ? (
        <>
          <div className={styles.signedInRow}>
            <span className={styles.signedInLabel}>
              Signed in as <span className={styles.signedInName}>{displayName}</span>
            </span>
            <div className={styles.signedInActions}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleSignOut}>
                <LogOut className={styles.btnIcon} />
                Sign Out
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => { clearMessages(); setConfirmDelete(true) }}
              >
                <Trash2 className={styles.btnIcon} />
                Delete
              </button>
            </div>
          </div>

          {confirmDelete && (
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                Permanently delete <strong>{displayName}</strong>? This will remove all their
                content, grammar data, and decks.
              </p>
              <div className={styles.confirmActions}>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>
                  Yes, delete
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Sign-in form */}
          <p className={styles.sectionLabel}>Sign In</p>
          <div className={styles.formGrid}>
            <input
              className={`${styles.input} ${styles.formGridFull}`}
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => { setSignInEmail(e.target.value); clearMessages() }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSignIn() }}
            />
            <input
              className={`${styles.input} ${styles.formGridFull}`}
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => { setSignInPassword(e.target.value); clearMessages() }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSignIn() }}
            />
            <div className={styles.formActions}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSignIn}
                disabled={!signInEmail.trim() || !signInPassword}
              >
                <LogIn className={styles.btnIcon} />
                Sign In
              </button>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Create account form */}
          <p className={styles.sectionLabel}>Create New Account</p>
          <div className={styles.formGrid}>
            <input
              className={styles.input}
              placeholder="First name"
              value={fName}
              onChange={(e) => { setFName(e.target.value); clearMessages() }}
            />
            <input
              className={styles.input}
              placeholder="Last name (optional)"
              value={lName}
              onChange={(e) => { setLName(e.target.value); clearMessages() }}
            />
            <input
              className={`${styles.input} ${styles.formGridFull}`}
              type="email"
              placeholder="Email"
              value={createEmail}
              onChange={(e) => { setCreateEmail(e.target.value); clearMessages() }}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              value={createPassword}
              onChange={(e) => { setCreatePassword(e.target.value); clearMessages() }}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearMessages() }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            />
            <div className={styles.formActions}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleCreate}
                disabled={!fName.trim() || !createEmail.trim() || !createPassword || !confirmPassword}
              >
                <UserPlus className={styles.btnIcon} />
                Create Account
              </button>
            </div>
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </div>
  )
}

export function Settings() {
  return (
    <main className={styles.page}>
      <h1 className={styles.pageHeading}>Settings</h1>
      <AccountSection />
    </main>
  )
}
