import PublicNavigation from "@/components/public/PublicNavigation";
import PublicFooter from "@/components/public/PublicFooter";
import { SkipToContent } from "@/components/public/SkipToContent";
import { NavigationProgress } from "@/components/public/NavigationProgress";
import { PageTransitionWrapper } from "@/components/public/PageTransitionWrapper";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <NavigationProgress />
      <SkipToContent />
      <PublicNavigation />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <PageTransitionWrapper>
          {children}
        </PageTransitionWrapper>
      </main>
      <PublicFooter />
    </div>
  );
}
