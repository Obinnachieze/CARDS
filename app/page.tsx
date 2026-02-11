import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { OccasionGallery } from "@/components/landing/gallery";
import { AboutContact } from "@/components/landing/about";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen antialiased relative">
      <div className="fixed inset-0 -z-20 w-full h-full">
        <BackgroundBeamsWithCollision className="h-full w-full">
          <></>
        </BackgroundBeamsWithCollision>
      </div>
      <Navbar />
      <div className="relative z-10">
        <Hero />
      </div>
      <div className="relative z-10">
        <section id="gallery" className="py-20">
          <OccasionGallery />
        </section>
        <AboutContact />
        <FAQ />
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
