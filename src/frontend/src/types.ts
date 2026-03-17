export type Role = "Admin" | "Officer" | "Investigator";

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
}

export type CriminalStatus = "Active" | "Arrested" | "Released" | "Deceased";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface Criminal {
  id: number;
  name: string;
  gender: string;
  age: number;
  photoUrl: string;
  address: string;
  crimeType: string;
  status: CriminalStatus;
  riskLevel: RiskLevel;
  createdAt: string;
}

export type Severity = "Minor" | "Moderate" | "Severe" | "Critical";

export interface Crime {
  id: number;
  title: string;
  description: string;
  crimeDate: string;
  location: string;
  severity: Severity;
  reportedById: string;
}

export type OfficerRank =
  | "Commissioner"
  | "Inspector"
  | "Sergeant"
  | "Constable";

export interface PoliceOfficer {
  id: number;
  name: string;
  rank: OfficerRank;
  badgeNumber: string;
  station: string;
}

export interface ArrestRecord {
  id: number;
  criminalId: number;
  officerId: number;
  arrestDate: string;
  location: string;
  notes: string;
}

export type CaseStatus =
  | "Open"
  | "Under Investigation"
  | "Closed"
  | "Dismissed";

export interface Case {
  id: number;
  crimeId: number;
  criminalId: number;
  assignedOfficerId: number;
  caseStatus: CaseStatus;
  courtDate: string;
  description: string;
}

export type EvidenceType =
  | "Physical"
  | "Digital"
  | "Documentary"
  | "Testimonial"
  | "Forensic";

export interface Evidence {
  id: number;
  caseId: number;
  evidenceType: EvidenceType;
  description: string;
  storageLocation: string;
  collectedDate: string;
  collectedById: string;
}

export interface ActivityLog {
  id: number;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notifType: string;
  isRead: boolean;
  createdAt: string;
}
