import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Upload, Check, Lock, Plus, Trash } from "lucide-react";
import WalletConnectButton from 'wallet-connect-button-react';
import WalletErrorBoundary from './WalletErrorBoundary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const personalDetailsSchema = z.object({
  fullName: z.string().optional(),
  day: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  documentType: z.string().optional(),
});

const addressSchema = z.object({
  streetAddress: z.string().optional(),
  aptSuite: z.string().optional(),
  postcode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const organizationSchema = z.object({
  organizationName: z.string().optional(),
  legalForm: z.string().optional(),
  registrationNumber: z.string().optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  ibanNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

const directorDetailsSchema = z.object({
  directorFullName: z.string().optional(),
  directorBirthDay: z.string().optional(),
  directorBirthMonth: z.string().optional(),
  directorBirthYear: z.string().optional(),
  directorPower: z.string().optional(),
});

const beneficialOwnerSchema = z.object({
  fullName: z.string().optional(),
  birthdate: z.string().optional(),
  streetAddress: z.string().optional(),
  aptSuite: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  sharePercentage: z.string().optional(),
  documentType: z.string().optional(),
});

const beneficialOwnersSchema = z.object({
  beneficialOwners: z.array(beneficialOwnerSchema),
});

type PersonalDetailsForm = z.infer<typeof personalDetailsSchema>;
type AddressForm = z.infer<typeof addressSchema>;
type OrganizationForm = z.infer<typeof organizationSchema>;
type DirectorDetailsForm = z.infer<typeof directorDetailsSchema>;
type BeneficialOwnerForm = z.infer<typeof beneficialOwnerSchema>;
type BeneficialOwnersForm = z.infer<typeof beneficialOwnersSchema>;

interface WalletAttributes {
  [key: string]: unknown;
  given_name?: string;
  family_name?: string;
  birthdate?: string;
  street_address?: string;
  house_number?: string;
  postal_code?: string;
  locality?: string;
  country?: string;
  company_name?: string;
  legal_name?: string;
  legal_form?: string;
  registration_number?: string;
  company_id?: string;
  website?: string;
  vat_number?: string;
  account_number?: string;
  registered_office?: string;
  euid?: string;
}

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess?: () => void;
}

interface WalletFieldShellProps {
  isLocked: boolean;
  children: React.ReactNode;
}

const WalletFieldShell: React.FC<WalletFieldShellProps> = ({ isLocked, children }) => (
  <div className="relative w-full">
    {children}
    {isLocked && (
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-green-600">
        <Lock className="h-4 w-4" aria-hidden="true" />
      </span>
    )}
  </div>
);

const LOCKED_INPUT_CLASSES = "wallet-field-locked wallet-field-locked-input border-green-500 bg-green-50";
const LOCKED_SELECT_CLASSES = "wallet-field-locked wallet-field-locked-select border-green-500 bg-green-50";

interface FileUploadButtonProps {
  uploadKey: string;
  buttonText: string;
  uploadedFiles: Record<string, string>;
  onFileSelect: (key: string, fileName: string) => void;
  disabled?: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  uploadKey,
  buttonText,
  uploadedFiles,
  onFileSelect,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onFileSelect(uploadKey, file.name);
    event.target.value = "";
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const selectedFileName = uploadedFiles[uploadKey];

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 gap-2"
        onClick={handleClick}
        disabled={disabled}
      >
        <Upload className="w-4 h-4" />
        {selectedFileName ? "Change file" : buttonText}
      </Button>
      {selectedFileName && (
        <p className="text-xs text-gray-600 truncate">
          Selected: {selectedFileName}
        </p>
      )}
    </div>
  );
};

const VerificationDialog: React.FC<VerificationDialogProps> = ({ open, onOpenChange, onSubmitSuccess }) => {
  console.log("VerificationDialog rendered with open:", open);
  
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [personalWalletAttributes, setPersonalWalletAttributes] = useState<WalletAttributes | null>(null);
  const [businessWalletAttributes, setBusinessWalletAttributes] = useState<WalletAttributes | null>(null);
  const [walletFilledFields, setWalletFilledFields] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const isFieldLocked = (fieldKey: string) => walletFilledFields.has(fieldKey);
  const getInputClasses = (fieldKey: string) => (isFieldLocked(fieldKey) ? LOCKED_INPUT_CLASSES : "");
  const getSelectClasses = (fieldKey: string) => (isFieldLocked(fieldKey) ? LOCKED_SELECT_CLASSES : "");


  // Helper function to parse date string
  const parseDateString = (dateStr: string) => {
    // Handle formats like "2000-03-24" or "23-05-2000"
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // Check if it's YYYY-MM-DD or DD-MM-YYYY format
      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        return {
          year: parts[0],
          month: new Date(0, parseInt(parts[1]) - 1).toLocaleString('en', { month: 'long' }),
          day: parts[2]
        };
      } else {
        // DD-MM-YYYY format
        return {
          year: parts[2],
          month: new Date(0, parseInt(parts[1]) - 1).toLocaleString('en', { month: 'long' }),
          day: parts[0]
        };
      }
    }
    return null;
  };


  const personalForm = useForm<PersonalDetailsForm>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      fullName: "",
      day: "",
      month: "",
      year: "",
      documentType: "",
    },
  });

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      streetAddress: "",
      aptSuite: "",
      postcode: "",
      city: "",
      country: "",
    },
  });

  const organizationForm = useForm<OrganizationForm>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      organizationName: "",
      legalForm: "",
      registrationNumber: "",
      website: "",
      taxId: "",
      ibanNumber: "",
      businessAddress: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  const directorForm = useForm<DirectorDetailsForm>({
    resolver: zodResolver(directorDetailsSchema),
    defaultValues: {
      directorFullName: "",
      directorBirthDay: "",
      directorBirthMonth: "",
      directorBirthYear: "",
      directorPower: "",
    },
  });

  const beneficialOwnersForm = useForm<BeneficialOwnersForm>({
    resolver: zodResolver(beneficialOwnersSchema),
    defaultValues: {
      beneficialOwners: [
        {
          fullName: "",
          birthdate: "",
          streetAddress: "",
          aptSuite: "",
          city: "",
          country: "",
          sharePercentage: "",
          documentType: "",
        },
      ],
    },
  });

  const {
    fields: beneficialOwnerFields,
    append: appendBeneficialOwner,
    remove: removeBeneficialOwner,
  } = useFieldArray({
    control: beneficialOwnersForm.control,
    name: "beneficialOwners",
  });

  const handleAddBeneficialOwner = () => {
    appendBeneficialOwner({
      fullName: "",
      birthdate: "",
      streetAddress: "",
      aptSuite: "",
      city: "",
      country: "",
      sharePercentage: "",
      documentType: "",
    });
  };

  const handleFileSelect = (key: string, fileName: string) => {
    setUploadedFiles((prev) => ({ ...prev, [key]: fileName }));
  };

  const handleRemoveBeneficialOwner = (index: number, fieldId: string) => {
    removeBeneficialOwner(index);
    setUploadedFiles((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (key.startsWith(`beneficialOwners.${fieldId}.`)) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  const markFieldsAsFilled = (fields: string[]) => {
    if (!fields.length) return;
    setWalletFilledFields((prev) => {
      const updated = new Set(prev);
      fields.forEach((field) => updated.add(field));
      return updated;
    });
  };

  const normalizeDateToISO = (dateStr: string) => {
    if (!dateStr) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [a, b, c] = parts;
      // DD-MM-YYYY
      if (c.length === 4 && a.length <= 2 && b.length <= 2) {
        return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
      }
      // YYYY-MM-DD
      if (a.length === 4 && b.length <= 2 && c.length <= 2) {
        return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  const extractBeneficialOwnersFromWallet = (attrs: WalletAttributes | null) => {
    if (!attrs) return { owners: [] as BeneficialOwnerForm[], filledKeys: [] as string[] };

    const ownersMap: Record<string, Partial<BeneficialOwnerForm> & { firstName?: string; familyName?: string }> = {};

    Object.entries(attrs).forEach(([key, rawValue]) => {
      const match = key.match(/^ubo(\d+)_/i);
      if (!match) return;
      const index = match[1];
      const value = typeof rawValue === 'string' ? rawValue : undefined;
      if (!ownersMap[index]) ownersMap[index] = {};
      const owner = ownersMap[index];

      if (key.endsWith('_first_name')) {
        owner.firstName = value;
        const fullName = `${owner.firstName || ''} ${owner.familyName || ''}`.trim();
        if (fullName) owner.fullName = fullName;
      } else if (key.endsWith('_family_name')) {
        owner.familyName = value;
        const fullName = `${owner.firstName || ''} ${owner.familyName || ''}`.trim();
        if (fullName) owner.fullName = fullName;
      } else if (key.endsWith('_birth_date')) {
        owner.birthdate = value ? normalizeDateToISO(value) : undefined;
      } else if (key.endsWith('_street')) {
        owner.streetAddress = value;
      } else if (key.endsWith('_house_number')) {
        const existingStreet = owner.streetAddress || '';
        owner.streetAddress = existingStreet ? `${existingStreet} ${value}`.trim() : value;
      } else if (key.endsWith('_city')) {
        owner.city = value;
      } else if (key.endsWith('_country')) {
        owner.country = value;
      } else if (key.includes('ownership_percentage')) {
        owner.sharePercentage = value;
      }
    });

    const owners: BeneficialOwnerForm[] = [];
    const filledKeys: string[] = [];

    Object.keys(ownersMap)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((ownerIndexString, arrayIndex) => {
        const data = ownersMap[ownerIndexString];
        const normalized: BeneficialOwnerForm = {
          fullName: data.fullName,
          birthdate: data.birthdate,
          streetAddress: data.streetAddress,
          aptSuite: data.aptSuite,
          city: data.city,
          country: data.country,
          sharePercentage: data.sharePercentage,
          documentType: data.documentType,
        };

        Object.entries(normalized).forEach(([fieldKey, fieldValue]) => {
          if (fieldValue) {
            filledKeys.push(`beneficialOwners.${arrayIndex}.${fieldKey}`);
          }
        });

        owners.push(normalized);
      });

    return { owners, filledKeys };
  };

  const isBeneficialOwnerFieldLocked = (index: number, field: keyof BeneficialOwnerForm) =>
    isFieldLocked(`beneficialOwners.${index}.${field}`);

  const hasBeneficialOwnerWalletData = (index: number) =>
    ['fullName', 'birthdate', 'streetAddress', 'city', 'country', 'sharePercentage'].some((field) =>
      isBeneficialOwnerFieldLocked(index, field as keyof BeneficialOwnerForm)
    );

  const handlePersonalWalletShare = (attrs: WalletAttributes | null) => {
    if (!attrs) return;
    setPersonalWalletAttributes(attrs);
    const filled: string[] = [];

    if (attrs.given_name && attrs.family_name) {
      const fullName = `${attrs.given_name} ${attrs.family_name}`.trim();
      personalForm.setValue('fullName', fullName);
      filled.push('personal.fullName');
    }

    if (attrs.birthdate) {
      const parsedDate = parseDateString(attrs.birthdate);
      if (parsedDate) {
        personalForm.setValue('day', parsedDate.day);
        personalForm.setValue('month', parsedDate.month);
        personalForm.setValue('year', parsedDate.year);
        filled.push('personal.day', 'personal.month', 'personal.year');
      }
    }

    if (attrs.street_address) {
      const streetLine = attrs.house_number
        ? `${attrs.street_address} ${attrs.house_number}`.trim()
        : attrs.street_address;
      addressForm.setValue('streetAddress', streetLine);
      filled.push('address.streetAddress');
    }

    if (attrs.postal_code) {
      addressForm.setValue('postcode', attrs.postal_code);
      filled.push('address.postcode');
    }

    if (attrs.locality) {
      addressForm.setValue('city', attrs.locality);
      filled.push('address.city');
    }

    if (attrs.country) {
      addressForm.setValue('country', attrs.country);
      filled.push('address.country');
    }

    markFieldsAsFilled(filled);
  };

  const handleBusinessWalletShare = (attrs: WalletAttributes | null) => {
    if (!attrs) return;
    setBusinessWalletAttributes(attrs);
    const filled: string[] = [];

    const organizationName = attrs.company_name || attrs.legal_name;
    if (organizationName) {
      organizationForm.setValue('organizationName', organizationName);
      filled.push('organization.name');
    }

    if (attrs.legal_form) {
      organizationForm.setValue('legalForm', attrs.legal_form);
      filled.push('organization.legalForm');
    }

    const registrationNumber = attrs.registration_number || attrs.company_id;
    if (registrationNumber) {
      organizationForm.setValue('registrationNumber', registrationNumber);
      filled.push('organization.registrationNumber');
    }

    if (attrs.website) {
      organizationForm.setValue('website', attrs.website);
      filled.push('organization.website');
    }

    if (attrs.vat_number) {
      organizationForm.setValue('taxId', attrs.vat_number);
      filled.push('organization.taxId');
    }

    if (attrs.account_number) {
      organizationForm.setValue('ibanNumber', attrs.account_number);
      filled.push('organization.ibanNumber');
    }

    if (attrs.registered_office) {
      organizationForm.setValue('businessAddress', attrs.registered_office);
      filled.push('organization.businessAddress');

      const postalMatch = attrs.registered_office.match(/\b\d{4}[A-Z]{2}\b/);
      if (postalMatch) {
        organizationForm.setValue('postalCode', postalMatch[0]);
        filled.push('organization.postalCode');
      }

      const cityMatch = attrs.registered_office.match(/\b\d{4}[A-Z]{2}\s*([A-Za-zÀ-ÿ\s'-]+)$/);
      if (cityMatch && cityMatch[1]) {
        const cityName = cityMatch[1].trim();
        if (cityName) {
          organizationForm.setValue('city', cityName);
          filled.push('organization.city');
        }
      }
    }

    if (attrs.country) {
      organizationForm.setValue('country', attrs.country);
      filled.push('organization.country');
    } else {
      const vatIsDutch = typeof attrs.vat_number === 'string' && attrs.vat_number.toUpperCase().startsWith('NL');
      const regIsDutch = typeof registrationNumber === 'string' && registrationNumber.toUpperCase().startsWith('NL');
      const euidIsDutch = typeof attrs.euid === 'string' && attrs.euid.toUpperCase().startsWith('NL');
      if (vatIsDutch || regIsDutch || euidIsDutch) {
        organizationForm.setValue('country', 'Nederland');
        filled.push('organization.country');
      }
    }

    const { owners, filledKeys: uboFilledKeys } = extractBeneficialOwnersFromWallet(attrs);
    if (owners.length) {
      beneficialOwnersForm.setValue('beneficialOwners', owners);
      filled.push(...uboFilledKeys);
    }

    markFieldsAsFilled(filled);
  };

  const hasPersonalWalletData = Boolean(personalWalletAttributes);
  const hasBusinessWalletData = Boolean(businessWalletAttributes);


  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const documentTypes = [
    "EU passport",
    "Driving licence",
    "EU ID card",
    "Residence permit"
  ];

  // Combined form submission handler
  const handleCombinedSubmit = () => {
    const personalData = personalForm.getValues();
    const addressData = addressForm.getValues();
    const organizationData = organizationForm.getValues();
    const directorData = directorForm.getValues();
    const beneficialOwnersData = beneficialOwnersForm.getValues();
    
    console.log("Personal Data:", personalData);
    console.log("Address Data:", addressData);
    console.log("Organization Data:", organizationData);
    console.log("Director Details:", directorData);
    console.log("Beneficial Owners:", beneficialOwnersData);
    
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
    onOpenChange(false);
    // Reset forms
    personalForm.reset();
    addressForm.reset();
    organizationForm.reset();
    directorForm.reset();
    beneficialOwnersForm.reset();
    setPersonalWalletAttributes(null);
    setBusinessWalletAttributes(null);
    setWalletFilledFields(new Set());
    setUploadedFiles({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={dialogContentRef} className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
          <DialogTitle className="text-xl font-normal">Verify your identity</DialogTitle>
          <DialogDescription>
            Complete the identity verification process to enable payments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Wallet Connection Section */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex flex-col items-center text-center gap-4">
                <WalletErrorBoundary>
                  <div className="inline-block">
                    <WalletConnectButton
                      // clientId="nlw_86df7d69a301446936ee2b731a22ca9e"
                      // apiKey="129433da3aafb9ca44cbdbbbab905702be0db6e2c629b6ac6f975be4d38ad7fa"
                      clientId="nlw_cf62b7b566c52240730470e881b21d26"
                      apiKey="46a5a1e1ab2d6466a39b51111ac0e2a13447bbac2d21d87a286bf5be86cc307a"
                      label="Share data from your Natural Person Wallet"
                      lang="en"
                      onSuccess={(attrs) => {
                        console.log("Personal wallet connection successful:", attrs);
                        handlePersonalWalletShare(attrs);
                      }}
                    />
                  </div>
                </WalletErrorBoundary>

                {personalWalletAttributes && (
                  <div className="w-full text-left">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Personal wallet data received</h4>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex flex-col items-center text-center gap-4">
                <WalletErrorBoundary>
                  <div className="inline-block">
                    <WalletConnectButton
                      clientId="nlw_6c168b1faee461183898df51f99c5478"
                      apiKey="a20f48c8f003502fc1f8db5751255178683041744670d6a6b059c0a6881745fa"
                      business
                      label="Share data with your business wallet"
                      lang="en"
                      onSuccess={(attrs) => {
                        console.log("Business wallet connection successful:", attrs);
                        handleBusinessWalletShare(attrs);
                      }}
                    />
                  </div>
                </WalletErrorBoundary>

                {businessWalletAttributes && (
                  <div className="w-full text-left">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Business wallet data received</h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Subtitle line */}
          <div className="text-center text-sm text-gray-500">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4">or fill in manually</span>
              </div>
            </div>
          </div>

          {/* Personal Identity Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-google-blue text-white rounded-full flex items-center justify-center text-sm font-medium min-w-[24px] min-h-[24px]">
                1
              </div>
              <h3 className="font-medium text-gray-900">Personal identity</h3>
            </div>

            <div className="ml-9 space-y-4">
              <Form {...personalForm}>
                <FormField
                  control={personalForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Full name
                        {walletFilledFields.has('personal.fullName') && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Filled by wallet
                          </span>
                        )}
                      </FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('personal.fullName')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('personal.fullName')}
                            className={getInputClasses('personal.fullName')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">
                    Your date of birth must match your ID
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={personalForm.control}
                      name="day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Day</FormLabel>
                          <WalletFieldShell isLocked={isFieldLocked('personal.day')}>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="23" 
                                readOnly={isFieldLocked('personal.day')}
                                className={getInputClasses('personal.day')}
                              />
                            </FormControl>
                          </WalletFieldShell>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Month</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isFieldLocked('personal.month')}
                          >
                          <WalletFieldShell isLocked={isFieldLocked('personal.month')}>
                            <FormControl>
                              <SelectTrigger className={getSelectClasses('personal.month')}>
                                <SelectValue placeholder="May" />
                              </SelectTrigger>
                            </FormControl>
                          </WalletFieldShell>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month} value={month}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Year</FormLabel>
                          <WalletFieldShell isLocked={isFieldLocked('personal.year')}>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="1994" 
                                readOnly={isFieldLocked('personal.year')}
                                className={getInputClasses('personal.year')}
                              />
                            </FormControl>
                          </WalletFieldShell>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className={hasPersonalWalletData ? 'opacity-50 pointer-events-none' : ''}>
                  <div className="flex items-center gap-2 mb-3">
                    <Label className="text-sm font-medium text-gray-900">Upload your ID</Label>
                    {hasPersonalWalletData && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Wallet-verified. No upload needed.
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Make sure that the document image that you upload is readable by following the{" "}
                    <a href="#" className="text-google-blue underline">document upload guidelines</a>.
                  </p>
                  
                  <FormField
                    control={personalForm.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-600">Select ID type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="EU passport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 mt-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Front of ID</Label>
                      <FileUploadButton
                        uploadKey="personal.idFront"
                        buttonText="Upload"
                        uploadedFiles={uploadedFiles}
                        onFileSelect={handleFileSelect}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Back of ID</Label>
                      <FileUploadButton
                        uploadKey="personal.idBack"
                        buttonText="Upload"
                        uploadedFiles={uploadedFiles}
                        onFileSelect={handleFileSelect}
                      />
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-google-blue text-white rounded-full flex items-center justify-center text-sm font-medium min-w-[24px] min-h-[24px]">
                2
              </div>
              <h3 className="font-medium text-gray-900">Address</h3>
            </div>

            <div className="ml-9 space-y-4">
              <p className="text-sm text-gray-600">
                Enter either what's on your ID or your permanent address
              </p>

              <Form {...addressForm}>
                <FormField
                  control={addressForm.control}
                  name="streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street address</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('address.streetAddress')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('address.streetAddress')}
                            className={getInputClasses('address.streetAddress')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addressForm.control}
                  name="aptSuite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apt, suite, etc. (optional)</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('address.aptSuite')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('address.aptSuite')}
                            className={getInputClasses('address.aptSuite')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addressForm.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode</FormLabel>
                        <WalletFieldShell isLocked={isFieldLocked('address.postcode')}>
                          <FormControl>
                            <Input 
                              {...field} 
                              readOnly={isFieldLocked('address.postcode')}
                              className={getInputClasses('address.postcode')}
                            />
                          </FormControl>
                        </WalletFieldShell>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addressForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Town/City</FormLabel>
                        <WalletFieldShell isLocked={isFieldLocked('address.city')}>
                          <FormControl>
                            <Input 
                              {...field} 
                              readOnly={isFieldLocked('address.city')}
                              className={getInputClasses('address.city')}
                            />
                          </FormControl>
                        </WalletFieldShell>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addressForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country/region</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('address.country')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('address.country')}
                            className={getInputClasses('address.country')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className={`space-y-4 ${hasPersonalWalletData ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Label className="text-sm font-medium text-gray-900">
                        Upload a document showing your current address
                      </Label>
                      {hasPersonalWalletData && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Wallet-verified. No upload needed.
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Provide a photo of a proof of address document from the following list. Your name and address must be clearly visible.
                    </p>
                    
                    <FileUploadButton
                      uploadKey="address.document"
                      buttonText="Upload address document"
                      uploadedFiles={uploadedFiles}
                      onFileSelect={handleFileSelect}
                    />
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <p className="font-medium text-gray-900 mb-2">DOCUMENTS ACCEPTED:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>A government-issued document or photo ID</li>
                        <li>A utility or phone bill (with a date in the last 60 days)</li>
                        <li>A bank statement (with a date in the last 60 days)</li>
                        <li>A lease or mortgage agreement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          {/* Organization Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-google-blue text-white rounded-full flex items-center justify-center text-sm font-medium min-w-[24px] min-h-[24px]">
                3
              </div>
              <h3 className="font-medium text-gray-900">Organisation information</h3>
            </div>

            <div className="ml-9 space-y-4">
              <p className="text-sm text-gray-600">
                Provide your organization details for verification and compliance purposes.
              </p>
              {hasBusinessWalletData && (
                <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  Filled automatically from business wallet
                </span>
              )}

              <Form {...organizationForm}>
                <FormField
                  control={organizationForm.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization name</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('organization.name')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('organization.name')}
                            className={getInputClasses('organization.name')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={organizationForm.control}
                  name="legalForm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal form</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('organization.legalForm')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('organization.legalForm')}
                            className={getInputClasses('organization.legalForm')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={organizationForm.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration number</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('organization.registrationNumber')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('organization.registrationNumber')}
                            className={getInputClasses('organization.registrationNumber')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={organizationForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('organization.website')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('organization.website')}
                            className={getInputClasses('organization.website')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={organizationForm.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('organization.taxId')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('organization.taxId')}
                            className={getInputClasses('organization.taxId')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={organizationForm.control}
                  name="ibanNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN number</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('organization.ibanNumber')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('organization.ibanNumber')}
                            className={getInputClasses('organization.ibanNumber')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={organizationForm.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business address</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('organization.businessAddress')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('organization.businessAddress')}
                            className={getInputClasses('organization.businessAddress')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={organizationForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <WalletFieldShell isLocked={isFieldLocked('organization.city')}>
                          <FormControl>
                            <Input 
                              {...field} 
                              readOnly={isFieldLocked('organization.city')}
                              className={getInputClasses('organization.city')}
                            />
                          </FormControl>
                        </WalletFieldShell>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={organizationForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal code</FormLabel>
                        <WalletFieldShell isLocked={isFieldLocked('organization.postalCode')}>
                          <FormControl>
                            <Input 
                              {...field} 
                              readOnly={isFieldLocked('organization.postalCode')}
                              className={getInputClasses('organization.postalCode')}
                            />
                          </FormControl>
                        </WalletFieldShell>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={organizationForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <WalletFieldShell isLocked={isFieldLocked('organization.country')}>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={isFieldLocked('organization.country')}
                            className={getInputClasses('organization.country')}
                          />
                        </FormControl>
                      </WalletFieldShell>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Document Upload Sections */}
                <div className={`space-y-6 mt-6 ${hasBusinessWalletData ? 'opacity-50 pointer-events-none' : ''}`}>
                  {/* Proof of Organisation Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Label className="text-sm font-medium text-gray-900">
                        Proof of organisation details
                      </Label>
                      {hasBusinessWalletData && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Wallet-verified. No upload needed.
                        </span>
                      )}
                    </div>
                    <FileUploadButton
                      uploadKey="organization.detailsDocument"
                      buttonText="Upload organisation details document"
                      uploadedFiles={uploadedFiles}
                      onFileSelect={handleFileSelect}
                    />
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <p className="font-medium text-gray-900 mb-2">DOCUMENTS ACCEPTED:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Certificate of registration or incorporation</li>
                        <li>VAT or tax clearance certificate</li>
                        <li>Extract from CRO register</li>
                      </ul>
                    </div>
                  </div>

                  {/* Proof of Organisation Address */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Label className="text-sm font-medium text-gray-900">
                        Proof of organisation address
                      </Label>
                      {hasBusinessWalletData && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Wallet-verified. No upload needed.
                        </span>
                      )}
                    </div>
                    <FileUploadButton
                      uploadKey="organization.addressDocument"
                      buttonText="Upload organisation address document"
                      uploadedFiles={uploadedFiles}
                      onFileSelect={handleFileSelect}
                    />
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <p className="font-medium text-gray-900 mb-2">DOCUMENTS ACCEPTED:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>A utility or phone bill (not older than 60 days)</li>
                        <li>A bank statement (not older than 60 days)</li>
                        <li>A lease or mortgage agreement</li>
                      </ul>
                    </div>
                  </div>

                  {/* Bank Account Statement */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Label className="text-sm font-medium text-gray-900">
                        Submit your bank account statement
                      </Label>
                      {hasBusinessWalletData && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Wallet-verified. No upload needed.
                        </span>
                      )}
                    </div>
                    <FileUploadButton
                      uploadKey="organization.bankStatement"
                      buttonText="Upload bank account statement"
                      uploadedFiles={uploadedFiles}
                      onFileSelect={handleFileSelect}
                    />
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <p className="font-medium text-gray-900 mb-2">REQUIREMENTS:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>The document must be in the name of the individual being verified and listed in the payments profile</li>
                        <li>The last four digits of the bank account number need to match the last four digits indicated on the bank account on your payment profile</li>
                        <li>The document is dated within the last 90 days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          {/* Ultimate Beneficial Owner Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-google-blue text-white rounded-full flex items-center justify-center text-sm font-medium min-w-[24px] min-h-[24px]">
                4
              </div>
              <h3 className="font-medium text-gray-900">Ultimate beneficial owners</h3>
            </div>

            <div className="ml-9 space-y-4">
              <p className="text-sm text-gray-600">
                Add the individuals who ultimately own or control the organisation. Include their identification details and ownership percentage.
              </p>

              <Form {...beneficialOwnersForm}>
                <div className="space-y-4">
                  {beneficialOwnerFields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Ultimate beneficial owner {index + 1}
                          </p>
                          <p className="text-xs text-gray-600">
                            Provide identity and ownership information.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-gray-500"
                          onClick={() => handleRemoveBeneficialOwner(index, field.id)}
                          disabled={beneficialOwnerFields.length === 1}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <FormField
                          control={beneficialOwnersForm.control}
                          name={`beneficialOwners.${index}.fullName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Full name
                                {isBeneficialOwnerFieldLocked(index, 'fullName') && (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Filled by wallet
                                  </span>
                                )}
                              </FormLabel>
                              <WalletFieldShell isLocked={isBeneficialOwnerFieldLocked(index, 'fullName')}>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    readOnly={isBeneficialOwnerFieldLocked(index, 'fullName')}
                                    className={getInputClasses(`beneficialOwners.${index}.fullName`)}
                                  />
                                </FormControl>
                              </WalletFieldShell>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={beneficialOwnersForm.control}
                          name={`beneficialOwners.${index}.birthdate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Date of birth
                                {isBeneficialOwnerFieldLocked(index, 'birthdate') && (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Filled by wallet
                                  </span>
                                )}
                              </FormLabel>
                              <WalletFieldShell isLocked={isBeneficialOwnerFieldLocked(index, 'birthdate')}>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                    readOnly={isBeneficialOwnerFieldLocked(index, 'birthdate')}
                                    className={getInputClasses(`beneficialOwners.${index}.birthdate`)}
                                  />
                                </FormControl>
                              </WalletFieldShell>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={beneficialOwnersForm.control}
                          name={`beneficialOwners.${index}.streetAddress`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Street address
                                {isBeneficialOwnerFieldLocked(index, 'streetAddress') && (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Filled by wallet
                                  </span>
                                )}
                              </FormLabel>
                              <WalletFieldShell isLocked={isBeneficialOwnerFieldLocked(index, 'streetAddress')}>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    readOnly={isBeneficialOwnerFieldLocked(index, 'streetAddress')}
                                    className={getInputClasses(`beneficialOwners.${index}.streetAddress`)}
                                  />
                                </FormControl>
                              </WalletFieldShell>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={beneficialOwnersForm.control}
                          name={`beneficialOwners.${index}.aptSuite`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apt, suite, etc (optional)</FormLabel>
                              <WalletFieldShell isLocked={isBeneficialOwnerFieldLocked(index, 'aptSuite')}>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    readOnly={isBeneficialOwnerFieldLocked(index, 'aptSuite')}
                                    className={getInputClasses(`beneficialOwners.${index}.aptSuite`)}
                                  />
                                </FormControl>
                              </WalletFieldShell>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={beneficialOwnersForm.control}
                            name={`beneficialOwners.${index}.city`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  City
                                  {isBeneficialOwnerFieldLocked(index, 'city') && (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                      Filled by wallet
                                    </span>
                                  )}
                                </FormLabel>
                                <WalletFieldShell isLocked={isBeneficialOwnerFieldLocked(index, 'city')}>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      readOnly={isBeneficialOwnerFieldLocked(index, 'city')}
                                      className={getInputClasses(`beneficialOwners.${index}.city`)}
                                    />
                                  </FormControl>
                                </WalletFieldShell>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={beneficialOwnersForm.control}
                            name={`beneficialOwners.${index}.country`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Country
                                  {isBeneficialOwnerFieldLocked(index, 'country') && (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                      Filled by wallet
                                    </span>
                                  )}
                                </FormLabel>
                                <WalletFieldShell isLocked={isBeneficialOwnerFieldLocked(index, 'country')}>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      readOnly={isBeneficialOwnerFieldLocked(index, 'country')}
                                      className={getInputClasses(`beneficialOwners.${index}.country`)}
                                    />
                                  </FormControl>
                                </WalletFieldShell>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={beneficialOwnersForm.control}
                          name={`beneficialOwners.${index}.sharePercentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Ultimate beneficial owner share (%)
                                {isBeneficialOwnerFieldLocked(index, 'sharePercentage') && (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Filled by wallet
                                  </span>
                                )}
                              </FormLabel>
                              <WalletFieldShell isLocked={isBeneficialOwnerFieldLocked(index, 'sharePercentage')}>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    step="0.01" 
                                    {...field}
                                    readOnly={isBeneficialOwnerFieldLocked(index, 'sharePercentage')}
                                    className={getInputClasses(`beneficialOwners.${index}.sharePercentage`)}
                                  />
                                </FormControl>
                              </WalletFieldShell>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <FormField
                            control={beneficialOwnersForm.control}
                            name={`beneficialOwners.${index}.documentType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm text-gray-600">
                                  Select ID type
                                  {hasBeneficialOwnerWalletData(index) && (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                      Wallet-verified. No upload needed.
                                    </span>
                                  )}
                                </FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  disabled={isBeneficialOwnerFieldLocked(index, 'documentType')}
                                >
                                  <WalletFieldShell isLocked={isBeneficialOwnerFieldLocked(index, 'documentType')}>
                                    <FormControl>
                                      <SelectTrigger className={getSelectClasses(`beneficialOwners.${index}.documentType`)}>
                                        <SelectValue placeholder="EU passport" />
                                      </SelectTrigger>
                                    </FormControl>
                                  </WalletFieldShell>
                                  <SelectContent>
                                    {documentTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className={`grid grid-cols-2 gap-4 ${hasBeneficialOwnerWalletData(index) ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Front of ID</Label>
                              <FileUploadButton
                                uploadKey={`beneficialOwners.${field.id}.idFront`}
                                buttonText="Upload"
                                uploadedFiles={uploadedFiles}
                                onFileSelect={handleFileSelect}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Back of ID</Label>
                              <FileUploadButton
                                uploadKey={`beneficialOwners.${field.id}.idBack`}
                                buttonText="Upload"
                                uploadedFiles={uploadedFiles}
                                onFileSelect={handleFileSelect}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-2"
                  onClick={handleAddBeneficialOwner}
                >
                  <Plus className="w-4 h-4" />
                  Add another ultimate beneficial owner
                </Button>
              </Form>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <Button 
                onClick={handleCombinedSubmit}
                className="bg-google-blue hover:bg-google-blue-hover text-white"
              >
                Submit verification request
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationDialog;