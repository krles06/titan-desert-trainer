import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, User } from 'lucide-react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/calendar', icon: CalendarDays, label: 'Calendario' },
    { to: '/profile', icon: User, label: 'Perfil' },
]

export default function BottomNav() {
    const location = useLocation()

    // Hide on landing, auth, and onboarding pages
    const hiddenPaths = ['/', '/login', '/register', '/forgot-password', '/onboarding', '/generate-plan']
    if (hiddenPaths.includes(location.pathname)) return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dunr-black/80 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
            <div className="flex items-center justify-around max-w-lg mx-auto px-4 py-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] justify-center ${isActive
                                ? 'text-dunr-blue'
                                : 'text-white/40 hover:text-white/60'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span className={`text-[11px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                                    {label}
                                </span>
                                {isActive && (
                                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-dunr-blue rounded-full shadow-[0_0_8px_rgba(0,163,255,0.5)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
