export type UserRole = 'participant' | 'admin';

export type ParticipantCategory = 'student' | 'research_scholar' | 'faculty';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  institution?: string;
  department?: string;
  designation?: string;
  participantCategory?: ParticipantCategory | '';
  isEmailVerified: boolean;
  createdAt: string;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Registration {
  _id: string;
  user: string | User;
  registrationRef: string;
  category: ParticipantCategory;
  feeAmount: number;
  feeCurrency: string;
  status: RegistrationStatus;
  institution?: string;
  department?: string;
  designation?: string;
  remarks?: string;
  confirmedAt?: string;
  createdAt: string;
}

export type PaymentMethod = 'upi' | 'cash' | 'bank_transfer';
export type PaymentStatus = 'not_submitted' | 'submitted' | 'under_verification' | 'verified' | 'rejected';

export interface Payment {
  _id: string;
  user: string | User;
  registration: string | Registration;
  registrationRef: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  paymentDate: string;
  transactionId?: string;
  payerUpiId?: string;
  receiptNumber?: string;
  transferReference?: string;
  transferDate?: string;
  remarks?: string;
  status: PaymentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type AbstractStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'revision_requested';

export interface Abstract {
  _id: string;
  user: string | User;
  abstractRef: string;
  title: string;
  abstractText: string;
  wordCount: number;
  authorName: string;
  coAuthors?: string;
  institution: string;
  department?: string;
  researchTheme: string;
  keywords?: string;
  contactEmail: string;
  attachmentPath?: string;
  attachmentOriginalName?: string;
  status: AbstractStatus;
  reviewNotes?: string;
  reviewedAt?: string;
  revisionComments?: string;
  createdAt: string;
}

export interface CommitteeMember {
  _id?: string;
  name: string;
  designation?: string;
  department?: string;
  institution?: string;
  group: 'office_bearers' | 'advisory_physics' | 'advisory_chemistry' | 'advisory_zoology' | 'advisory_botany' | 'advisory_wit' | 'organizing';
  role?: string;
  sortOrder: number;
}

export interface EventTheme {
  _id?: string;
  title: string;
  description?: string;
  category: 'workshop' | 'conference';
  isPublished: boolean;
  sortOrder: number;
}

export interface ImportantDate {
  _id?: string;
  label: string;
  date: string;
  confirmed: boolean;
}

export interface Announcement {
  _id?: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export interface EventSettings {
  eventTitle: string;
  eventSubtitle: string;
  conferenceTitle: string;
  conferenceSubtitle: string;
  workshopTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  datesConfirmed: boolean;
  datesNote: string;
  venue: string;
  venueAddress: string;
  aboutEvent: string;
  aboutINS: string;
  aboutLNMU: string;
  aboutWIT: string;
  fees: {
    student: number;
    research_scholar: number;
    faculty: number;
  };
  paymentMethods: {
    upi: boolean;
    cash: boolean;
    bank_transfer: boolean;
  };
  paymentInstructions: string;
  abstractWordLimit: number;
  abstractDeadline: string;
  abstractInstructions: string;
  registrationDeadline: string;
  registrationOpen: boolean;
  abstractSubmissionOpen: boolean;
  contactEmail: string;
  contactPhone: string;
  contactWhatsApp: string;
  logoUrl?: string;
  bannerUrl?: string;
  insLogoUrl?: string;
  lnmuLogoUrl?: string;
  witLogoUrl?: string;
  importantDates: ImportantDate[];
  announcements: Announcement[];
  eligibility: string;
  accommodation: string;
  travelInfo: string;
  committees: CommitteeMember[];
  themes: EventTheme[];
  hasAbstractTemplate: boolean;
  abstractTemplateName?: string;
  abstractTemplateFile?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  confirmedRegistrations: number;
  studentRegistrations: number;
  scholarRegistrations: number;
  facultyRegistrations: number;
  pendingPayments: number;
  verifiedPayments: number;
  submittedAbstracts: number;
  pendingAbstracts: number;
  acceptedAbstracts: number;
  rejectedAbstracts: number;
}
