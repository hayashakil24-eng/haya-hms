import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

const pages = { home: Home, rooms: Rooms, about: About, contact: Contact, admin: Admin };

function currentPage() {
  const name = window.location.hash.replace("#/", "");
  return pages[name] ? name : "home";
}

function App() {
  const [page, setPage] = useState(currentPage());

  useEffect(() => {
    function handleHashChange() {
      setPage(currentPage());
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const Page = pages[page];

  return (
    <>
      <Header page={page} />
      <main>
        <Page />
      </main>
      <Footer />
    </>
  );
}

export default App;
