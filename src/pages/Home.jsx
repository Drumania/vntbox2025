import Discover from "@/components/Discover";

import Footer from "@/components/Footer";
import CalendarHome from "@/components/CalendarHome";

export default function Home() {
  return (
    <>
      <div className="container">
        <div className="row">
          <aside className="col-3 d-none d-lg-block">
            <Discover />
            <Footer />
          </aside>

          <main className="col-12 col-lg-9">
            <CalendarHome />
          </main>
        </div>
      </div>
    </>
  );
}
