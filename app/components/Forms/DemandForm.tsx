import {
  demandFormSchema,
  DemandFormType,
} from "@/app/types/demand-form-schema";
import { Input, Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const DemandForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemandFormType>({
    resolver: zodResolver(demandFormSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 flex flex-col gap-4"
    >
      <div className="flex gap-4">
        <Input
          className="w-full"
          placeholder="Jméno"
          name="firstName"
          // value={form.firstName}
          // onChange={handleChange}
        />

        <Input
          className="w-full"
          placeholder="Příjmení"
          name="lastName"
          // value={form.lastName}
          // onChange={handleChange}
        />
      </div>

      <Input
        placeholder="Email"
        // popover="hint"
        type="email"
        name="email"
        // value={form.email}
        // onChange={handleChange}
      />

      <Button type="submit" color="primary" className="self-center">
        Odeslat poptávku
      </Button>
    </form>
  );
};

export default DemandForm;
