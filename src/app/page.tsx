import { MusicPlayer } from "@/components/MusicPlayer";
import "@fontsource/poppins"; // default 400
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-black-alt) p-16">
      <MusicPlayer />
    </div>
  );
}
