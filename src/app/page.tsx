import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background flex items-center justify-center">
      <div className="text-center px-6 max-w-2xl">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 mb-6 shadow-lg shadow-violet-500/30">
          <span className="text-white font-bold text-3xl">R</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Restaurant
          </span>
        </h1>

        <p className="text-lg text-muted-foreground mb-10">
          Scan the QR code at your table or click below to view our menu and place an order.
        </p>

        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full px-10 py-6 text-lg shadow-lg shadow-violet-500/30"
        >
          <Link href="/order">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            View Menu & Order
          </Link>
        </Button>

        <p className="text-sm text-muted-foreground mt-12">
          Staff? {" "}
          <Link href="/login" className="text-violet-600 hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}
