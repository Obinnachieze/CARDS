import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Header } from "@/components/ui/header";
import { Hero } from "@/components/landing/hero";
import { Footer } from "@/components/landing/footer";
import { TemplateMasonry } from "@/components/landing/template-masonry";

export default function Home() {
  return (
    <main className="min-h-screen antialiased relative">
      <div className="fixed inset-0 -z-20 w-full h-full">
        <BackgroundBeamsWithCollision className="h-full w-full">
          <></>
        </BackgroundBeamsWithCollision>
      </div>
      <Header />
      <div className="relative z-10">
        <Hero />
        <TemplateMasonry />
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
