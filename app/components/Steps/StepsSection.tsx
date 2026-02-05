import React from "react";
import { Flex, Steps } from "antd";

const items = [
  {
    title: "Mapa",
    content: "Vyberte plochu z mapy",
  },
  {
    title: "Formulář",
    content: "Vyplňte kontaktní údaje",
    // subTitle: "Left 00:00:08",
  },
  {
    title: "Odeslání",
  },
];

const StepsSection = ({ currentStep }: { currentStep: number }) => {
  return (
    <Flex className="w-1/2" vertical gap="large">
      <Steps current={currentStep} items={items} size="small" />
    </Flex>
  );
};

export default StepsSection;
