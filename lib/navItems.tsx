import Link from 'next/link'
import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'

type NavItemProps = {
    href: string
    label: string
    icon: LucideIcon
    active?: boolean
    isExpanded?: boolean 
    onClick?: () => void 
}

const NavItem = ({ href, label, icon: Icon, active = false, isExpanded = true, onClick }: NavItemProps) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                // If expanded, use normal padding. If slim, center the icon. On desktop, always use normal padding.
                isExpanded ? "px-4" : "px-0 justify-center md:px-4 md:justify-start",
                active
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-900"
            )}
            title={!isExpanded ? label : undefined} // Shows a tooltip on hover when text is hidden
        >
            <Icon size={20} className="shrink-0" />
            
            {/* Hide text on mobile slim view, show on expanded or desktop */}
            <span className={clsx(
                "whitespace-nowrap transition-all",
                isExpanded ? "block" : "hidden md:block"
            )}>
                {label}
            </span>
        </Link>
    );
}

export default NavItem