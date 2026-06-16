import { z } from "zod";
import { registrationSchema } from "@/lib/validations/registration.schema";

export const updateParticipantSchema = registrationSchema;

export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
