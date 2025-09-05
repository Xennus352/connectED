import AddForm from "@/components/pages/form/AddForm";
import Navbar from "@/components/pages/Navbar";
export default function Home() {
  return (
    <main>
      <Navbar />
      <h1>Welcome to the Home Page</h1>
      <div>
        {/* <AddForm/> */}
        <div className="join join-vertical">
          <input
            type="radio"
            name="theme-buttons"
            className="btn theme-controller join-item"
            aria-label="Default"
            value="default"
          />
          <input
            type="radio"
            name="theme-buttons"
            className="btn theme-controller join-item"
            aria-label="Retro"
            value="retro"
          />
          <input
            type="radio"
            name="theme-buttons"
            className="btn theme-controller join-item"
            aria-label="Cyberpunk"
            value="cyberpunk"
          />
          <input
            type="radio"
            name="theme-buttons"
            className="btn theme-controller join-item"
            aria-label="Valentine"
            value="valentine"
          />
          <input
            type="radio"
            name="theme-buttons"
            className="btn theme-controller join-item"
            aria-label="Aqua"
            value="aqua"
          />
        </div>
      </div>
    </main>
  );
}
