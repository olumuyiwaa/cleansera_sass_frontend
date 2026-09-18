export default function PortalLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f4f7f5] antialiased">{children}</div>
    );
}