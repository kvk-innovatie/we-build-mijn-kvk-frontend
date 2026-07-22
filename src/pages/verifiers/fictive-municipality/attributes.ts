// Helpers for flattening and labelling the attribute payload returned by the business wallet.

export type WalletAttributes = Record<string, unknown> | unknown[] | null;
export type FlatAttributes = Record<string, unknown>;

export function flattenAttributes(value: unknown, prefix = ""): FlatAttributes {
  const result: FlatAttributes = {};
  if (value == null) return result;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      Object.assign(result, flattenAttributes(item, prefix ? `${prefix}[${index}]` : String(index)));
    });
    return result;
  }
  if (typeof value === "object") {
    Object.keys(value as Record<string, unknown>).forEach((key) => {
      Object.assign(
        result,
        flattenAttributes((value as Record<string, unknown>)[key], prefix ? `${prefix}.${key}` : key)
      );
    });
    return result;
  }
  result[prefix] = value;
  return result;
}

function normalizeKey(key: string): string {
  return key
    .split(".")
    .pop()!
    .replace(/\[\d+\]/g, "")
    .toLowerCase()
    .replace(/[_\s-]/g, "");
}

function findAttribute(flat: FlatAttributes, candidates: string[]): { key: string; value: unknown } | null {
  for (const key of Object.keys(flat)) {
    const normalized = key.toLowerCase().replace(/[_\s-]/g, "");
    for (const candidate of candidates) {
      if (normalized.includes(candidate.toLowerCase().replace(/[_\s-]/g, ""))) {
        return { key, value: flat[key] };
      }
    }
  }
  return null;
}

const hiddenKeys = new Set(["representativespersonbirthdate", "representativesbirthdate", "monetarylimit"]);

const labelMaps: Record<"en" | "nl", Record<string, string>> = {
  en: {
    companyname: "Company name",
    bedrijfsnaam: "Company name",
    handelsnaam: "Trade name",
    tradename: "Trade name",
    legalname: "Legal name",
    organizationname: "Organisation name",
    organisatienaam: "Organisation name",
    name: "Name",
    euid: "EUID",
    legalentityid: "EUID",
    legalpersonid: "EUID",
    kvk: "Chamber of Commerce number",
    kvknumber: "Chamber of Commerce number",
    cocnumber: "Chamber of Commerce number",
    coc: "Chamber of Commerce number",
    chambernumber: "Chamber of Commerce number",
    registrationnumber: "Registration number",
    address: "Address",
    street: "Street",
    streetname: "Street name",
    housenumber: "House number",
    city: "City",
    postalcode: "Postal code",
    country: "Country",
    legalform: "Legal form",
    establishmentnumber: "Establishment number",
    scope: "Authorisation",
    mandatescope: "Authorisation",
    representativesname: "Representative name",
    representativespersonname: "Representative name",
    representativespersongivenname: "Representative given name",
    representativespersonfamilyname: "Representative family name",
    representativesrole: "Representative role",
    representativesfunction: "Representative function",
    representativesauthorisationtype: "Authorisation type",
    representativesauthorizationtype: "Authorisation type",
    role: "Role",
    function: "Function",
    validfrom: "Valid from",
    validuntil: "Valid until",
    issueddate: "Issue date",
    expirationdate: "Expiration date",
  },
  nl: {
    companyname: "Bedrijfsnaam",
    bedrijfsnaam: "Bedrijfsnaam",
    handelsnaam: "Handelsnaam",
    tradename: "Handelsnaam",
    legalname: "Statutaire naam",
    organizationname: "Organisatienaam",
    organisatienaam: "Organisatienaam",
    name: "Naam",
    euid: "EUID",
    legalentityid: "EUID",
    legalpersonid: "EUID",
    kvk: "KvK-nummer",
    kvknumber: "KvK-nummer",
    cocnumber: "KvK-nummer",
    coc: "KvK-nummer",
    chambernumber: "KvK-nummer",
    registrationnumber: "Registratienummer",
    address: "Adres",
    street: "Straat",
    streetname: "Straatnaam",
    housenumber: "Huisnummer",
    city: "Plaats",
    postalcode: "Postcode",
    country: "Land",
    legalform: "Rechtsvorm",
    establishmentnumber: "Vestigingsnummer",
    scope: "Bevoegdheid",
    mandatescope: "Bevoegdheid",
    representativesname: "Naam vertegenwoordiger",
    representativespersonname: "Naam vertegenwoordiger",
    representativespersongivenname: "Voornaam vertegenwoordiger",
    representativespersonfamilyname: "Achternaam vertegenwoordiger",
    representativesrole: "Rol vertegenwoordiger",
    representativesfunction: "Functie vertegenwoordiger",
    representativesauthorisationtype: "Soort bevoegdheid",
    representativesauthorizationtype: "Soort bevoegdheid",
    role: "Rol",
    function: "Functie",
    validfrom: "Geldig vanaf",
    validuntil: "Geldig tot",
    issueddate: "Uitgiftedatum",
    expirationdate: "Vervaldatum",
  },
};

export function labelForAttribute(key: string, lang: "en" | "nl" = "en"): string {
  const normalized = normalizeKey(key);
  const map = labelMaps[lang] ?? labelMaps.en;
  if (map[normalized]) return map[normalized];
  return key
    .split(".")
    .pop()!
    .replace(/\[\d+\]/g, "")
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  const str = String(value).trim();
  return str === "" || str === "[]" || str === "{}";
}

function isScopeKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return normalized === "scope" || normalized.endsWith("scope");
}

// Returns displayable [key, value] pairs: hidden keys removed, empty values dropped
// (except scopes), and all scope values merged into a single comma-separated entry.
export function displayableAttributes(flat: FlatAttributes): Array<[string, unknown]> {
  const entries = Object.entries(flat).filter(([key, value]) => {
    const normalized = normalizeKey(key);
    if (hiddenKeys.has(normalized)) return false;
    return isEmptyValue(value) ? !isScopeKey(key) : true;
  });

  const scopeValues: string[] = [];
  let firstScopeKey: string | null = null;
  const rest: Array<[string, unknown]> = [];
  for (const [key, value] of entries) {
    if (isScopeKey(key)) {
      if (firstScopeKey === null) firstScopeKey = key;
      scopeValues.push(String(value));
    } else {
      rest.push([key, value]);
    }
  }
  if (scopeValues.length > 0 && firstScopeKey !== null) {
    rest.push([firstScopeKey, scopeValues.join(", ")]);
  }
  return rest;
}

export interface CompanyInfo {
  companyName: string;
  euid: string;
}

export function extractCompany(flat: FlatAttributes): CompanyInfo {
  const name = findAttribute(flat, [
    "legalname",
    "companyname",
    "bedrijfsnaam",
    "handelsnaam",
    "tradename",
    "organizationname",
    "organisatienaam",
  ]);
  const euid = findAttribute(flat, ["euid", "legalentityid", "legalpersonid"]);
  return {
    // Empty when not found so callers can substitute a translated fallback.
    companyName: name ? String(name.value) : "",
    euid: euid ? String(euid.value) : "-",
  };
}

export interface RepresentativeInfo {
  name: string;
  birthdate: string;
}

export function extractRepresentative(flat: FlatAttributes): RepresentativeInfo {
  const nameAttr = findAttribute(flat, ["representativespersonname", "representativesname"]);
  let name = nameAttr ? String(nameAttr.value) : "";
  if (!name) {
    const given = findAttribute(flat, ["representativespersongivenname", "representativesgivenname"]);
    const family = findAttribute(flat, ["representativespersonfamilyname", "representativesfamilyname"]);
    name = [given?.value, family?.value].filter(Boolean).join(" ");
  }
  const birthdate = findAttribute(flat, ["representativespersonbirthdate", "representativesbirthdate"]);
  return {
    name,
    birthdate: birthdate ? String(birthdate.value) : "",
  };
}
