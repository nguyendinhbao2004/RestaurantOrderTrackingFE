import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-violet-50/50 dark:bg-violet-950/20">
            <AdminSidebar />
            <main className="pl-64">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
