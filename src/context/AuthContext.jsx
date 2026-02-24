import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DEMO_MODE, DEMO_USER, DEMO_PROFILE } from '../lib/mockData'

const AuthContext = createContext({})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (DEMO_MODE) {
            // In demo mode, check localStorage for auth state
            const demoAuth = localStorage.getItem('demo_auth')
            if (demoAuth) {
                setUser(DEMO_USER)
                const savedProfile = localStorage.getItem('demo_profile')
                if (savedProfile) {
                    setProfile(JSON.parse(savedProfile))
                }
            }
            setLoading(false)
            return
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
            }
            setProfile(data || null)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function signUp(email, password) {
        if (DEMO_MODE) {
            localStorage.setItem('demo_auth', 'true')
            setUser({ ...DEMO_USER, email })
            return { data: { user: { ...DEMO_USER, email } }, error: null }
        }
        const { data, error } = await supabase.auth.signUp({ email, password })
        return { data, error }
    }

    async function signIn(email, password) {
        if (DEMO_MODE) {
            localStorage.setItem('demo_auth', 'true')
            const savedProfile = localStorage.getItem('demo_profile')
            if (savedProfile) {
                setProfile(JSON.parse(savedProfile))
            }
            setUser({ ...DEMO_USER, email })
            return { data: { user: { ...DEMO_USER, email } }, error: null }
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        return { data, error }
    }

    async function signOut() {
        if (DEMO_MODE) {
            localStorage.removeItem('demo_auth')
            localStorage.removeItem('demo_profile')
            setUser(null)
            setProfile(null)
            return
        }
        await supabase.auth.signOut()
    }

    async function resetPassword(email) {
        if (DEMO_MODE) {
            return { data: {}, error: null }
        }
        const { data, error } = await supabase.auth.resetPasswordForEmail(email)
        return { data, error }
    }

    async function saveProfile(profileData) {
        if (DEMO_MODE) {
            const fullProfile = { ...DEMO_PROFILE, ...profileData, id: DEMO_USER.id }
            localStorage.setItem('demo_profile', JSON.stringify(fullProfile))
            setProfile(fullProfile)
            return { data: fullProfile, error: null }
        }
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ ...profileData, id: user.id, subscription_status: 'active' })
            .select()
            .single()
        if (!error) setProfile(data)
        return { data, error }
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        saveProfile,
        isAuthenticated: !!user,
        hasProfile: !!profile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
