export interface FeaturedCompanyRow {
  id: string;
  companyId: number;
  name: string;
  slug: string;
  logoUrl: string;
  location: string;
  businessTypes: string[];
  businessType: string;
  isFeatured: boolean;
  featuredSince: string | null;
  priority: number | null;
}

export const featuredCompanyFilterOptions = {
  featuredStatus: [
    "All",
    "Featured",
    "Not Featured",
  ],

  businessType: [
    "All",
    "Manufacturer",
    "Supplier",
    "Exporter",
    "OEM",
    "Distributor",
  ],
};