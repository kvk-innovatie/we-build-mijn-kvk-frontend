/**
 * EUCC (European Company Certificate) types
 * Based on EUCC Attestation Rulebook v1.1 (Template 1.1, 20-08-2025)
 * SD-JWT VC encoding, VCT: uri:eu.eudi.eucc.1
 */

// Section 2.5 - Address
export interface EuccRegisteredAddress {
  full_address: string;
  care_of?: string;
  thorough_fare?: string;
  locator_designator?: string;
  post_code?: string;
  post_name?: string;
  post_office_box?: string;
  locator_name?: string;
  admin_unit_level_1?: string;
  admin_unit_level_2?: string;
}

// Section 2.2 - Legal person activity (NACE)
export interface EuccLegalPersonActivity {
  code: string;
  description: string;
}

// Section 2.4 - Natural person representative
export interface EuccNaturalPersonRepresentative {
  full_name: string;
  date_of_birth: string;
  nationality?: string;
  signatory_rule: string;
}

// Section 2.4 - Legal person representative
export interface EuccLegalPersonRepresentative {
  name: string;
  id: string;
  legal_form_type: string;
  signatory_rule: string;
}

// Section 2.4 - Legal representative (can be natural or legal person)
export interface EuccLegalRepresentative {
  natural_person?: EuccNaturalPersonRepresentative;
  legal_person?: EuccLegalPersonRepresentative;
}

// Section 2.3 - Share capital
export interface EuccShareCapital {
  amount: string;
  currency: string;
}

// Section 2.3 - Digital contact point
export interface EuccDigitalContactPoint {
  website?: string;
  email?: string;
}

// Section 3.2.1 - Attestation status (revocation)
export interface EuccStatus {
  type: "status-list";
  status_list_credential: string;
  status_list_index: number;
  status_purpose: "revocation";
}

// Full EUCC credential attributes (SD-JWT VC payload)
export interface EuccCredential {
  // Mandatory attributes (Section 2.2)
  attestation_legal_category: "EAA" | "Pub-EAA" | "QEAA";
  legal_person_name: string;
  legal_person_id: string; // EUID format
  legal_form_type: string;
  registration_member_state: string; // ISO 3166-1 Alpha-2
  registered_address: EuccRegisteredAddress;
  registration_date: string; // ISO 8601 (YYYY-MM-DD)
  legal_person_status: string;
  legal_person_activity: EuccLegalPersonActivity;
  legal_representative: EuccLegalRepresentative[];

  // Optional attributes (Section 2.3)
  share_capital?: EuccShareCapital;
  legal_person_duration?: string; // ISO 8601 date
  digital_contact_point?: EuccDigitalContactPoint;

  // Mandatory metadata (Section 2.6)
  iss: string; // issuing_authority
  exp: number; // expiry_date (Unix timestamp)
  issuing_country: string; // ISO 3166-1 Alpha-2

  // Conditional metadata (Section 2.8)
  status?: EuccStatus;
  trust_anchor?: string;
}
