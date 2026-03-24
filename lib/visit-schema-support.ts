import { Prisma } from "@prisma/client";

export function isMissingVisitSchemaError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2021" && error.code !== "P2022") {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("appointmentvisit") || message.includes("appointmentsegment");
}
