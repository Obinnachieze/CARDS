import { Hero } from "@/components/landing/hero";
import { OccasionGallery } from "@/components/landing/gallery";

export default function Home() {
  return (
    <main className="min-h-screen bg-black antialiased bg-grid-white/[0.02]">
      <Hero />
      <section id="gallery" className="py-20">
        <OccasionGallery />
      </section>
      <footer className="py-10 text-center text-neutral-500 text-sm">
        &copy; {new Date().getFullYear()} VibePost. All rights reserved.
      </footer>
    </main>
  );
}
