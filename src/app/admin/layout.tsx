import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-background dark:from-violet-950/20 dark:to-background">
            <AdminSidebar />
            <main className="pl-64">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
