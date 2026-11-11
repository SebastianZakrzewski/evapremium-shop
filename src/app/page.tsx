import { HeroSection } from "@/features/marketing"
import { HomeBelowFold } from "./HomeBelowFold"

export default function Home() {
  return (
    <div className="min-h-screen home-page">
      <HeroSection />
      <HomeBelowFold />
    </div>
  )
}
