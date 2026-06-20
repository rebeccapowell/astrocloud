export type WowlOperation = {
  id: string;
  label: string;
  kind: "read" | "compute" | "write";
  system?: string;
};

export const wowlOperations: WowlOperation[] = [
  { id: "read-order", label: "Read order", kind: "read" },
  { id: "read-customer", label: "Read customer", kind: "read" },
  { id: "calculate", label: "Calculate totals", kind: "compute" },
  { id: "charge", label: "Charge payment", kind: "write", system: "Gateway" },
  { id: "crm", label: "Update CRM", kind: "write", system: "CRM" },
  { id: "email", label: "Send email", kind: "write", system: "Email" },
  { id: "event", label: "Publish event", kind: "write", system: "Broker" },
];

export const wowlSafeDefault = [
  "read-order",
  "read-customer",
  "calculate",
  "charge",
];
export const wowlSprayDefault = wowlOperations.map(operation => operation.id);
