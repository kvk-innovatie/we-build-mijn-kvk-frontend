import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import WalletConnectButton from "wallet-connect-button-react";
import CredentialVerificationDialog from "@/components/CredentialVerificationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Shield,
  User,
  Building2,
  ClipboardList,
} from "lucide-react";

type Step = 1 | 2 | 3 | "success";

const STEPS = [
  { num: 1, label: "Provide natural person information", icon: User },
  { num: 2, label: "Provide company information", icon: Building2 },
  { num: 3, label: "Finalize", icon: ClipboardList },
] as const;

interface CompanyForm {
  activityDescription: string;
  mainActivity: string;
  sellsToConsumers: string;
  consumerSalesChannels: string[];
  consumerSalesOther: string;
  sellsToCompanies: string;
  importsProducts: string;
  exportsProducts: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  hasSeparatePostalAddress: string;
  postalAddress: string;
  telephone1: string;
  telephone2: string;
  faxNumber: string;
  internetAddress: string;
  emailAddress: string;
  messageBoxName: string;
  fullTimePersons: string;
  partTimePersons: string;
}

const INITIAL_FORM: CompanyForm = {
  activityDescription: "",
  mainActivity: "",
  sellsToConsumers: "",
  consumerSalesChannels: [],
  consumerSalesOther: "",
  sellsToCompanies: "",
  importsProducts: "",
  exportsProducts: "",
  streetAddress: "",
  postalCode: "",
  city: "",
  hasSeparatePostalAddress: "",
  postalAddress: "",
  telephone1: "",
  telephone2: "",
  faxNumber: "",
  internetAddress: "",
  emailAddress: "",
  messageBoxName: "",
  fullTimePersons: "",
  partTimePersons: "",
};

const CONSUMER_CHANNELS = [
  "in a shop or kiosk",
  "at the market",
  "via street trading",
  "online",
  "from home",
  "through mail order",
];

const RadioGroup = ({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex gap-6">
    {["no", "yes"].map((opt) => (
      <label key={opt} className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name={name}
          checked={value === opt}
          onChange={() => onChange(opt)}
          className="w-4 h-4 text-[#1a2b57] accent-[#1a2b57]"
        />
        <span className="text-sm capitalize">{opt}</span>
      </label>
    ))}
  </div>
);

const InfogreffeVerifierPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [personData, setPersonData] = useState<Record<string, unknown> | null>(
    null
  );
  const [companyData, setCompanyData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyForm>(INITIAL_FORM);
  const topRef = useRef<HTMLDivElement>(null);

  const updateForm = <K extends keyof CompanyForm>(
    field: K,
    value: CompanyForm[K]
  ) => {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleChannel = (channel: string) => {
    setCompanyForm((prev) => ({
      ...prev,
      consumerSalesChannels: prev.consumerSalesChannels.includes(channel)
        ? prev.consumerSalesChannels.filter((c) => c !== channel)
        : [...prev.consumerSalesChannels, channel],
    }));
  };

  const handleCompanyVerificationSuccess = (
    credential: Record<string, unknown>
  ) => {
    setCompanyData(credential);
  };

  const handleSubmit = () => {
    setCurrentStep("success");
  };

  // Scroll to top on every step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStep]);

  const filteredEntries = (data: Record<string, unknown>) =>
    Object.entries(data).filter(
      ([key]) =>
        !["cnf", "iss", "iat", "vct", "sub", "nbf", "jti", "status"].includes(
          key
        )
    );

  const formatValue = (key: string, value: unknown): string => {
    if (key === "exp" && typeof value === "number") {
      return new Date(value * 1000).toLocaleDateString();
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formSummaryEntries = (): [string, string][] => {
    const entries: [string, string][] = [];
    if (companyForm.activityDescription)
      entries.push(["Activity description", companyForm.activityDescription]);
    if (companyForm.mainActivity)
      entries.push(["Main activity", companyForm.mainActivity]);
    if (companyForm.sellsToConsumers)
      entries.push([
        "Sells to consumers (retail)",
        companyForm.sellsToConsumers,
      ]);
    if (
      companyForm.sellsToConsumers === "yes" &&
      companyForm.consumerSalesChannels.length > 0
    )
      entries.push([
        "Sales channels",
        companyForm.consumerSalesChannels.join(", ") +
          (companyForm.consumerSalesOther
            ? `, ${companyForm.consumerSalesOther}`
            : ""),
      ]);
    if (companyForm.sellsToCompanies)
      entries.push([
        "Sells to companies (wholesale)",
        companyForm.sellsToCompanies,
      ]);
    if (companyForm.importsProducts)
      entries.push(["Imports products", companyForm.importsProducts]);
    if (companyForm.exportsProducts)
      entries.push(["Exports products", companyForm.exportsProducts]);
    if (companyForm.streetAddress)
      entries.push(["Address", companyForm.streetAddress]);
    if (companyForm.postalCode || companyForm.city)
      entries.push([
        "Postal code / City",
        `${companyForm.postalCode} ${companyForm.city}`.trim(),
      ]);
    if (companyForm.hasSeparatePostalAddress === "yes" && companyForm.postalAddress)
      entries.push(["Postal address", companyForm.postalAddress]);
    if (companyForm.telephone1)
      entries.push(["Telephone 1", companyForm.telephone1]);
    if (companyForm.telephone2)
      entries.push(["Telephone 2", companyForm.telephone2]);
    if (companyForm.faxNumber)
      entries.push(["Fax number", companyForm.faxNumber]);
    if (companyForm.internetAddress)
      entries.push(["Internet address", companyForm.internetAddress]);
    if (companyForm.emailAddress)
      entries.push(["Email address", companyForm.emailAddress]);
    if (companyForm.messageBoxName)
      entries.push(["Message box name", companyForm.messageBoxName]);
    if (companyForm.fullTimePersons)
      entries.push(["Full-time persons", companyForm.fullTimePersons]);
    if (companyForm.partTimePersons)
      entries.push(["Part-time persons", companyForm.partTimePersons]);
    return entries;
  };

  return (
    <div className="min-h-screen bg-white" ref={topRef}>
      {/* Infogreffe Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/infogreffe.png"
                alt="Infogreffe"
                className="h-24 object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-[#1a2b57]/60">Services</span>
              <span className="text-[#1a2b57]/60">Formalités</span>
              <span className="text-[#1a2b57]/60">Aide</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center text-[#1a2b57] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a2b57]">
            Creating a company branch
          </h1>
          <p className="text-gray-500 mt-2">
            Complete the steps below to register a new company branch.
          </p>
        </div>

        {/* Success Screen */}
        {currentStep === "success" && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Company branch successfully created!
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Your request to open a company branch has been submitted
              successfully. You will receive a confirmation shortly.
            </p>

            {/* Summary */}
            <div className="max-w-2xl mx-auto text-left space-y-4 mb-8">
              {personData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Natural Person Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {filteredEntries(personData).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-1 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-gray-600 text-right max-w-[60%] whitespace-pre-wrap">
                          {formatValue(key, value)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {companyData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Verified Company Data (EUCC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {filteredEntries(companyData).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-1 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-gray-600 text-right max-w-[60%] whitespace-pre-wrap">
                          {formatValue(key, value)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {formSummaryEntries().length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company Details (Manual)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {formSummaryEntries().map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between py-1 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-700">
                          {label}
                        </span>
                        <span className="text-gray-600 text-right max-w-[60%]">
                          {value}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <Link to="/">
              <Button className="bg-[#1a2b57] hover:bg-[#1a2b57]/90 text-white">
                Back to home
              </Button>
            </Link>
          </div>
        )}

        {/* Step Indicator */}
        {currentStep !== "success" && (
          <>
            <div className="flex items-center mb-10">
              {STEPS.map((s, i) => (
                <div
                  key={s.num}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        currentStep === s.num
                          ? "bg-[#1a2b57] text-white"
                          : typeof currentStep === "number" &&
                              currentStep > s.num
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {typeof currentStep === "number" &&
                      currentStep > s.num ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        s.num
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium hidden sm:block ${
                        currentStep === s.num
                          ? "text-[#1a2b57]"
                          : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-4 h-px bg-gray-300" />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Natural Person Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1a2b57]">
                    <User className="w-5 h-5" />
                    Step 1: Provide natural person information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-500">
                    Share your personal information from your digital wallet to
                    verify your identity.
                  </p>

                  {!personData && (
                    <div className="flex justify-center py-4">
                      <div className="wallet-connect-wrapper infogreffe">
                        <WalletConnectButton
                          clientId="nlw_196823a7c1930f6117ad054188e82061"
                          apiKey="90d04cffa52851d4a777c7572919f42ff4260fde2ee6bd3934c3f37dbf616f3e"
                          label="Share data from your wallet"
                          lang="en"
                          onSuccess={(attrs: Record<string, unknown>) => {
                            setPersonData(attrs);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {personData && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Data received from wallet
                        </h4>
                        <div className="space-y-1 text-sm">
                          {filteredEntries(personData).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between py-1.5 border-b border-green-100 last:border-0"
                            >
                              <span className="font-medium text-green-900 capitalize">
                                {key.replace(/_/g, " ")}
                              </span>
                              <span className="text-green-800 text-right max-w-[60%] whitespace-pre-wrap">
                                {formatValue(key, value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => setCurrentStep(2)}
                          className="bg-[#1a2b57] hover:bg-[#1a2b57]/90 text-white gap-2"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Company Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* EUCC Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1a2b57]">
                      <Shield className="w-5 h-5" />
                      Step 2: Provide company information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-500">
                      First, verify your company registration data by presenting
                      your EUCC credential from your business wallet.
                    </p>

                    {!companyData && (
                      <div className="flex justify-center py-4">
                        <CredentialVerificationDialog
                          onVerificationSuccess={
                            handleCompanyVerificationSuccess
                          }
                          defaultCredentialType="eucc"
                          trigger={
                            <Button className="bg-[#1a2b57] hover:bg-[#1a2b57]/90 text-white font-medium gap-2">
                              <Shield className="w-4 h-4" />
                              Verify company credentials (EUCC)
                            </Button>
                          }
                        />
                      </div>
                    )}

                    {companyData && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Company data verified (EUCC)
                        </h4>
                        <div className="space-y-1 text-sm">
                          {filteredEntries(companyData).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between py-1.5 border-b border-green-100 last:border-0"
                            >
                              <span className="font-medium text-green-900 capitalize">
                                {key.replace(/_/g, " ")}
                              </span>
                              <span className="text-green-800 text-right max-w-[60%] whitespace-pre-wrap">
                                {formatValue(key, value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Manual Company Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1a2b57] text-base">
                      <Building2 className="w-5 h-5" />
                      Details of the company branch in France
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* 2.2 Activity description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        2.2 Provide a short description of the company's actual
                        activities, services and/or products
                      </label>
                      <p className="text-xs text-gray-400">
                        e.g. 'wholesaler in outer clothing' instead of 'clothing
                        sales', 'management consultancy firm' instead of
                        'consultancy firm'
                      </p>
                      <Textarea
                        value={companyForm.activityDescription}
                        onChange={(e) =>
                          updateForm("activityDescription", e.target.value)
                        }
                        placeholder="Describe the company's activities..."
                        rows={3}
                      />
                    </div>

                    {/* 2.3 Main activity */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        2.3 If there are several business activities, services
                        and/or products, indicate the most important one
                      </label>
                      <Input
                        value={companyForm.mainActivity}
                        onChange={(e) =>
                          updateForm("mainActivity", e.target.value)
                        }
                        placeholder="Most important activity"
                      />
                    </div>

                    {/* 2.4 Sells to consumers */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        2.4 Does the company sell products to consumers? (retail
                        trade)
                      </label>
                      <RadioGroup
                        name="sellsToConsumers"
                        value={companyForm.sellsToConsumers}
                        onChange={(v) => updateForm("sellsToConsumers", v)}
                      />
                      {companyForm.sellsToConsumers === "yes" && (
                        <div className="ml-6 space-y-2 border-l-2 border-[#1a2b57]/20 pl-4">
                          <p className="text-sm text-gray-500">
                            These products are sold:
                          </p>
                          {CONSUMER_CHANNELS.map((channel) => (
                            <label
                              key={channel}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={companyForm.consumerSalesChannels.includes(
                                  channel
                                )}
                                onChange={() => toggleChannel(channel)}
                                className="w-4 h-4 accent-[#1a2b57]"
                              />
                              <span className="text-sm">{channel}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={companyForm.consumerSalesOther !== ""}
                              onChange={() =>
                                updateForm(
                                  "consumerSalesOther",
                                  companyForm.consumerSalesOther ? "" : " "
                                )
                              }
                              className="w-4 h-4 accent-[#1a2b57]"
                            />
                            <span className="text-sm">otherwise, namely:</span>
                          </label>
                          {companyForm.consumerSalesOther !== "" && (
                            <Input
                              value={companyForm.consumerSalesOther.trim()}
                              onChange={(e) =>
                                updateForm(
                                  "consumerSalesOther",
                                  e.target.value || " "
                                )
                              }
                              placeholder="Specify other sales channel"
                              className="ml-6 max-w-sm"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2.5 Sells to companies */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        2.5 Does the company sell products to other companies?
                        (wholesale)
                      </label>
                      <RadioGroup
                        name="sellsToCompanies"
                        value={companyForm.sellsToCompanies}
                        onChange={(v) => updateForm("sellsToCompanies", v)}
                      />
                    </div>

                    {/* 2.6 Imports */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        2.6 Does the company import products?
                      </label>
                      <RadioGroup
                        name="importsProducts"
                        value={companyForm.importsProducts}
                        onChange={(v) => updateForm("importsProducts", v)}
                      />
                    </div>

                    {/* 2.7 Exports */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        2.7 Does the company export products?
                      </label>
                      <RadioGroup
                        name="exportsProducts"
                        value={companyForm.exportsProducts}
                        onChange={(v) => updateForm("exportsProducts", v)}
                      />
                    </div>

                    <hr className="border-gray-200" />

                    {/* Address */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Address of the company in France
                      </label>
                      <p className="text-xs text-gray-400">
                        In the case of several branches: provide information for
                        the principal place of business in France
                      </p>
                      <Input
                        value={companyForm.streetAddress}
                        onChange={(e) =>
                          updateForm("streetAddress", e.target.value)
                        }
                        placeholder="Street and number"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={companyForm.postalCode}
                          onChange={(e) =>
                            updateForm("postalCode", e.target.value)
                          }
                          placeholder="Postal code"
                        />
                        <Input
                          value={companyForm.city}
                          onChange={(e) => updateForm("city", e.target.value)}
                          placeholder="City"
                        />
                      </div>
                    </div>

                    {/* 2.9 Separate postal address */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        2.9 Does the company have a separate postal address?
                      </label>
                      <p className="text-xs text-gray-400">
                        e.g. a P.O. Box or private address for receiving mail
                      </p>
                      <RadioGroup
                        name="hasSeparatePostalAddress"
                        value={companyForm.hasSeparatePostalAddress}
                        onChange={(v) =>
                          updateForm("hasSeparatePostalAddress", v)
                        }
                      />
                      {companyForm.hasSeparatePostalAddress === "yes" && (
                        <Input
                          value={companyForm.postalAddress}
                          onChange={(e) =>
                            updateForm("postalAddress", e.target.value)
                          }
                          placeholder="P.O. Box / mailing address"
                          className="ml-6 max-w-sm"
                        />
                      )}
                    </div>

                    <hr className="border-gray-200" />

                    {/* 2.10 Contact details */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        2.10 Contact details
                      </label>
                      <p className="text-xs text-gray-400">
                        Telephone, fax, internet address, email and message box
                        name of the company
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={companyForm.telephone1}
                          onChange={(e) =>
                            updateForm("telephone1", e.target.value)
                          }
                          placeholder="Telephone number 1"
                        />
                        <Input
                          value={companyForm.telephone2}
                          onChange={(e) =>
                            updateForm("telephone2", e.target.value)
                          }
                          placeholder="Telephone number 2"
                        />
                        <Input
                          value={companyForm.faxNumber}
                          onChange={(e) =>
                            updateForm("faxNumber", e.target.value)
                          }
                          placeholder="Fax number"
                        />
                        <Input
                          value={companyForm.internetAddress}
                          onChange={(e) =>
                            updateForm("internetAddress", e.target.value)
                          }
                          placeholder="Internet address (www)"
                        />
                        <Input
                          value={companyForm.emailAddress}
                          onChange={(e) =>
                            updateForm("emailAddress", e.target.value)
                          }
                          placeholder="Email address"
                        />
                        <Input
                          value={companyForm.messageBoxName}
                          onChange={(e) =>
                            updateForm("messageBoxName", e.target.value)
                          }
                          placeholder="Message box name"
                        />
                      </div>
                      <p className="text-xs text-gray-400 italic">
                        By registering the Message Box name in the Commercial
                        Register, the non-resident legal entity/company is known
                        to be sufficiently accessible for receiving electronic
                        messages of public authorities.
                      </p>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 2.11 Number of persons */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        2.11 How many persons work at the company?
                      </label>
                      <p className="text-xs text-gray-400">
                        Include partners/directors, hired workers, temporary
                        workers, and family members working at the company.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Full-time (15 hours or more per week)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={companyForm.fullTimePersons}
                            onChange={(e) =>
                              updateForm("fullTimePersons", e.target.value)
                            }
                            placeholder="Number of persons"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Part-time (fewer than 15 hours per week)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={companyForm.partTimePersons}
                            onChange={(e) =>
                              updateForm("partTimePersons", e.target.value)
                            }
                            placeholder="Number of persons"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="bg-[#1a2b57] hover:bg-[#1a2b57]/90 text-white gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Finalize */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1a2b57]">
                    <ClipboardList className="w-5 h-5" />
                    Step 3: Finalize
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-500">
                    Review the information below and confirm to submit your
                    company branch registration.
                  </p>

                  {/* Person Data Summary */}
                  {personData && (
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-[#1a2b57] mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Natural Person Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        {filteredEntries(personData).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-1 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="text-gray-600 text-right max-w-[60%] whitespace-pre-wrap">
                              {formatValue(key, value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EUCC Data Summary */}
                  {companyData && (
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-[#1a2b57] mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Verified Company Data (EUCC)
                      </h4>
                      <div className="space-y-1 text-sm">
                        {filteredEntries(companyData).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-1 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="text-gray-600 text-right max-w-[60%] whitespace-pre-wrap">
                              {formatValue(key, value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Form Data Summary */}
                  {formSummaryEntries().length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-[#1a2b57] mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Company Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        {formSummaryEntries().map(([label, value]) => (
                          <div
                            key={label}
                            className="flex justify-between py-1 border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-gray-700">
                              {label}
                            </span>
                            <span className="text-gray-600 text-right max-w-[60%]">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit branch registration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default InfogreffeVerifierPage;
