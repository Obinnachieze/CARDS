import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { OccasionGallery } from "@/components/landing/gallery";
import { AboutContact } from "@/components/landing/about";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";


export default function Home() {
  return (
    <main className="min-h-screen antialiased relative">
      <Navbar />
      <div className="bg-white dark:bg-transparent relative z-10 transition-colors duration-300">
        <Hero />
      </div>
      <div className="bg-black dark:bg-transparent relative z-10 transition-colors duration-300">
        <section id="gallery" className="py-20">
          <OccasionGallery />
        </section>
        <AboutContact />
        <FAQ />
      </div>
      <div className="bg-white dark:bg-transparent relative z-10 transition-colors duration-300">
        <Footer />
      </div>
    </main>
  );
}
