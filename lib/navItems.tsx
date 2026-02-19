'use client'

import Link from 'next/link'
import clsx from 'clsx'

type NavItemProps = {
    href: string
    label: string
    active?: boolean
}


const NavItem = ({ href, label, active = false }: NavItemProps) => {
    return (
        <Link
            href={href}
            className={clsx(`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-900"
                }`)}
        >
            {label}
        </Link>
    );
}

export default NavItem
