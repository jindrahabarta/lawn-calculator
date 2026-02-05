import { z } from "zod";

export const demandFormSchema = z.object({
  firstName: z.string().nonempty("Pole je povinné"),
  lastName: z.string().nonempty("Pole je povinné"),
  email: z.email("Email je ve špatném formátu"),
});

export type DemandFormType = z.infer<typeof demandFormSchema>;
