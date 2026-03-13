const uitgeslotenSubdomeinen = new Set(["www", "app", "platform"]);

export function extractTenantSlugFromHostname(hostname: string) {
  const normalized = hostname.toLowerCase().split(":")[0];

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized.endsWith(".localhost")
  ) {
    return null;
  }

  const delen = normalized.split(".");
  if (delen.length < 3) {
    return null;
  }

  const subdomein = delen[0];
  if (!subdomein || uitgeslotenSubdomeinen.has(subdomein)) {
    return null;
  }

  return subdomein;
}
