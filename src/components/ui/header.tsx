'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from './auth-modal';

export function Header() {
    const { user, loading, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt="Vayura"
                            className="h-10 w-auto"
                        />
                        <span className="text-lg font-semibold text-gray-900 tracking-tight">Vayura</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {user && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/leaderboard"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Leaderboard
                                </Link>
                                <Link
                                    href="/methodology"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Methodology
                                </Link>
                                <Link
                                    href="/plant"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Plant a Tree
                                </Link>
                                <Link
                                    href="/donate"
                                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Donate Tree
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Auth */}
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                        ) : user ? (
                            <>
                                <a
                                    href="https://github.com/manasdutta04/vayura"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    Contribute
                                </a>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName || 'User'}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user.displayName || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <Link
                                                href="/contribution"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                My Contributions
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <a
                                    href="https://github.com/manasdutta04/vayura"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    Contribute
                                </a>
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                                >
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Spacer for fixed header */}
            <div className="h-16" />

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
