import DemandForm from "./components/Forms/DemandForm";
import MapProvider from "./components/Map/MapProvider";
import MapSelector from "./components/Map/MapSelector";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>
        <MapProvider>
          <MapSelector />
        </MapProvider>

        <DemandForm></DemandForm>
      </div>
    </div>
  );
}
