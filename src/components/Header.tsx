'use client';

import Link from 'next/link';
import { Film, List } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 text-red-500">
                    <Film size={24} />
                    <span className="font-bold text-xl tracking-tight">MovieMatch</span>
                </Link>

                <nav className="flex items-center space-x-4">
                    <Link
                        href="/"
                        className={`text-sm font-semibold transition ${pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Match
                    </Link>
                    <Link
                        href="/watchlist"
                        className={`p-2 rounded-full transition ${pathname === '/watchlist' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <List size={24} />
                    </Link>
                </nav>
            </div>
        </header>
    );
}
