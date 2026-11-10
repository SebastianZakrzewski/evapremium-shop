import { HeroSection } from "@/features/marketing"
import QuickSearchBar from "@/components/quick-search-bar"
import { HomeBelowFold } from "./HomeBelowFold"

export default function Home() {
  return (
    <div className="min-h-screen home-page">
      <QuickSearchBar />
      <HeroSection />
      <HomeBelowFold />
    </div>
  )
}
