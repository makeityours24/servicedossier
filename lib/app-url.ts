function trimSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAppUrl() {
  return trimSlashes(process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000");
}

export function getTenantMode() {
  return process.env.NEXT_PUBLIC_TENANT_MODE === "subdomain" ? "subdomain" : "query";
}

export function getBaseDomain() {
  return process.env.NEXT_PUBLIC_BASE_DOMAIN?.trim().toLowerCase() || "";
}

export function getSalonLoginUrl(salonSlug: string) {
  const appUrl = getAppUrl();
  const tenantMode = getTenantMode();
  const baseDomain = getBaseDomain();

  if (tenantMode === "subdomain" && baseDomain) {
    return `https://${salonSlug}.${baseDomain}/login`;
  }

  return `${appUrl}/login?salon=${encodeURIComponent(salonSlug)}`;
}
