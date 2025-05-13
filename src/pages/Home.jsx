import MainEvents from "../components/MainEvents";
import WhoAdd from "../components/WhoAdd";
import Footer from "../components/Footer";
import Calendar from "../components/Calendar";

export default function Home() {
  return (
    <>
      <div className="container">
        <div className="row">
          <aside className="col-3 d-none d-lg-block">
            <MainEvents />
            <WhoAdd />
            <Footer />
          </aside>

          <main className="col-12 col-lg-9">
            <Calendar />
          </main>
        </div>
      </div>
    </>
  );
}
