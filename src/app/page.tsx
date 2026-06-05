import { RecipeWorkspace } from "@/features/recipe-workspace";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Main Workspace handles its own header based on Stitch designs */}
      <main className="flex-1 flex flex-col">
        <RecipeWorkspace />
      </main>

      {/* Navigation */}
      <BottomNav />
    </div>
  );
}
