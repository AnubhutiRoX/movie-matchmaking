import Link from 'next/link'
import { signup } from '@/app/login/actions'

export default async function SignupPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 m-auto min-h-[calc(100vh-4rem)]">
            <Link
                href="/"
                className="absolute left-8 top-24 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
            </Link>

            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                <h1 className="text-4xl font-bold mb-6 text-center">Sign Up</h1>

                {searchParams?.error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-3 rounded mb-4 text-red-200 text-center text-sm">
                        {searchParams.error}
                    </div>
                )}

                <label className="text-md" htmlFor="email">
                    Email
                </label>
                <input
                    className="rounded-md px-4 py-2 bg-inherit border mb-6 text-black"
                    name="email"
                    placeholder="you@example.com"
                    required
                />
                <label className="text-md" htmlFor="password">
                    Password
                </label>
                <input
                    className="rounded-md px-4 py-2 bg-inherit border mb-6 text-black"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />
                <button
                    formAction={signup}
                    className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 hover:bg-green-600 transition-colors"
                >
                    Sign Up
                </button>
                <p className="text-sm text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="underline hover:text-green-400">
                        Sign In
                    </Link>
                </p>
            </form>
        </div>
    )
}
