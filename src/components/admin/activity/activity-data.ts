export type ActivityUserType = "Buyer" | "Supplier";

export type ActivityType =
  | "Viewed Product"
  | "Viewed Company"
  | "Saved Product"
  | "Saved Company"
  | "Sent Inquiry"
  | "Replied to Inquiry"
  | "Added Product"
  | "Updated Product";

export type ActivityItemType = "product" | "company" | "inquiry";

export interface ActivityRow {
  id: string;

  userId: string;

  userName: string;

  userType: ActivityUserType;

  activity: ActivityType;

  itemType: ActivityItemType;

  itemId: string;

  itemName: string;

  time: string;
}

export const activityData: ActivityRow[] = [
  {
    id: "ACT001",
    userId: "USR001245",
    userName: "Rahul Sharma",
    userType: "Buyer",
    activity: "Viewed Product",
    itemType: "product",
    itemId: "industrial-air-cooler-ic-15000",
    itemName: "Industrial Air Cooler IC-15000",
    time: "08 Sep 2024, 10:32 AM",
  },

  {
    id: "ACT002",
    userId: "USR001245",
    userName: "Rahul Sharma",
    userType: "Buyer",
    activity: "Saved Company",
    itemType: "company",
    itemId: "abc-cooling-industries",
    itemName: "ABC Cooling Industries",
    time: "08 Sep 2024, 10:30 AM",
  },

  {
    id: "ACT003",
    userId: "USR001247",
    userName: "Amit Patel",
    userType: "Buyer",
    activity: "Sent Inquiry",
    itemType: "company",
    itemId: "arctic-cooling-systems",
    itemName: "Arctic Cooling Systems",
    time: "08 Sep 2024, 10:25 AM",
  },

  {
    id: "ACT004",
    userId: "USR001246",
    userName: "ABC Cooling Industries",
    userType: "Supplier",
    activity: "Replied to Inquiry",
    itemType: "inquiry",
    itemId: "INQ-2026-0012",
    itemName: "INQ-2026-0012",
    time: "08 Sep 2024, 10:15 AM",
  },

  {
    id: "ACT005",
    userId: "USR001246",
    userName: "Priya Chauhan",
    userType: "Buyer",
    activity: "Viewed Company",
    itemType: "company",
    itemId: "maxcool-industries",
    itemName: "MaxCool Industries",
    time: "08 Sep 2024, 09:48 AM",
  },

  {
    id: "ACT006",
    userId: "USR001250",
    userName: "Manoj Jaiswal",
    userType: "Buyer",
    activity: "Saved Product",
    itemType: "product",
    itemId: "tower-air-cooler-tc-3000",
    itemName: "Tower Air Cooler",
    time: "08 Sep 2024, 09:40 AM",
  },

  {
    id: "ACT007",
    userId: "USR001253",
    userName: "Neha Patel",
    userType: "Supplier",
    activity: "Added Product",
    itemType: "product",
    itemId: "desert-air-cooler-9000",
    itemName: "Desert Air Cooler 9000",
    time: "08 Sep 2024, 09:22 AM",
  },

  {
    id: "ACT008",
    userId: "USR001251",
    userName: "Ritu Thakkar",
    userType: "Buyer",
    activity: "Viewed Product",
    itemType: "product",
    itemId: "personal-air-cooler",
    itemName: "Personal Air Cooler",
    time: "08 Sep 2024, 09:10 AM",
  },

  {
    id: "ACT009",
    userId: "USR001246",
    userName: "Cool Breeze Pvt. Ltd.",
    userType: "Supplier",
    activity: "Updated Product",
    itemType: "product",
    itemId: "cb-4500",
    itemName: "CB-4500",
    time: "08 Sep 2024, 08:55 AM",
  },

  {
    id: "ACT010",
    userId: "USR001252",
    userName: "Vikram Singh",
    userType: "Buyer",
    activity: "Sent Inquiry",
    itemType: "company",
    itemId: "prime-motors",
    itemName: "Prime Motors",
    time: "08 Sep 2024, 08:40 AM",
  },
];

export const activityFilterOptions = {
  userTypes: ["All", "Buyer", "Supplier"],

  activityTypes: [
    "All",
    "Viewed Product",
    "Viewed Company",
    "Saved Product",
    "Saved Company",
    "Sent Inquiry",
    "Replied to Inquiry",
    "Added Product",
    "Updated Product",
  ],
};
