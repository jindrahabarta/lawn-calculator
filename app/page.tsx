"use client";
import { useState } from "react";
import DemandForm from "./components/Forms/DemandForm";
import MapProvider from "./components/Map/MapProvider";
import MapSelector from "./components/Map/MapSelector";
import { Button } from "@heroui/react";
import { Check } from "@gravity-ui/icons";
import StepsSection from "./components/Steps/StepsSection";

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [totalArea, setTotalArea] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="rounded-2xl bg-gray-100 border border-black/10 p-4 absolute top-2 left-2">
        <div>1. Zadejte adresu</div>
        <div>2. Vyberte plochu o kterou se jedná</div>
        <div>3. Zadejte kontaktní údaje</div>
      </div>

      <StepsSection currentStep={step}></StepsSection>

      <div className="mt-4 w-1/2 bg-gray-50 border border-black/10 rounded-3xl p-6 pt-4">
        {step === 0 && (
          <MapProvider>
            <MapSelector getTotalArea={(area: number) => setTotalArea(area)} />
          </MapProvider>
        )}

        <div style={{ marginTop: 10 }}>
          <strong>Celková plocha:</strong> {totalArea.toFixed(2)} m² <br />
          {step === 0 && (
            <Button
              onClick={() => totalArea !== 0 && setStep(1)}
              className="bg-green-400 mt-4 text-lg px-8"
            >
              <Check />
              Potvrdit výběr
            </Button>
          )}
        </div>

        {step === 1 && <DemandForm></DemandForm>}
      </div>
    </div>
  );
}
