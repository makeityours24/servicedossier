import type { UserRole, UserStatus } from "@prisma/client";

export function hasTeamManagementRights(role: UserRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function getSalonAccessError(params: {
  actorSalonId?: number | null;
  resourceSalonId?: number | null;
}) {
  if (!params.actorSalonId || !params.resourceSalonId) {
    return "Deze resource hoort niet bij deze salon.";
  }

  if (params.actorSalonId !== params.resourceSalonId) {
    return "Deze resource hoort niet bij deze salon.";
  }

  return null;
}

export function getTeamUpdatePolicyError(params: {
  actorRole: UserRole;
  actorId: number;
  targetUserId: number;
  currentTargetRole: UserRole;
  nextTargetRole: UserRole;
  nextStatus: UserStatus;
  ownerCount: number;
}) {
  if (!hasTeamManagementRights(params.actorRole)) {
    return "Alleen eigenaren en admins kunnen medewerkers beheren.";
  }

  if (params.actorRole !== "OWNER" && params.nextTargetRole === "OWNER") {
    return "Alleen een eigenaar kan een andere eigenaar toewijzen.";
  }

  if (params.targetUserId === params.actorId && params.nextStatus === "UITGESCHAKELD") {
    return "Je kunt je eigen account niet uitschakelen.";
  }

  const ownerVerdwijnt =
    params.currentTargetRole === "OWNER" &&
    (params.nextTargetRole !== "OWNER" || params.nextStatus === "UITGESCHAKELD");

  if (ownerVerdwijnt && params.ownerCount <= 1) {
    return "Deze salon moet minimaal één actieve eigenaar behouden.";
  }

  return null;
}

export function getTeamDeletePolicyError(params: {
  actorRole: UserRole;
  actorId: number;
  targetUserId: number;
  targetUserRole: UserRole;
  ownerCount: number;
}) {
  if (!hasTeamManagementRights(params.actorRole)) {
    return "Alleen eigenaren en admins kunnen medewerkers beheren.";
  }

  if (params.targetUserId === params.actorId) {
    return "Je kunt je eigen account niet verwijderen.";
  }

  if (params.targetUserRole === "OWNER" && params.ownerCount <= 1) {
    return "Deze salon moet minimaal één eigenaar behouden.";
  }

  return null;
}
