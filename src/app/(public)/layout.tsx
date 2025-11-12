import Footer from "@/components/footer";
import BarraDeNavegacion from "../components/BarraDeNavegacion";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>
        <nav>
          <BarraDeNavegacion />
        </nav>
      </header>
      {children}
      <footer className="mt-10">
        <Footer />
      </footer>
    </>
  );
}