export const USER_PAGE_SIZES = [10, 20, 50, 100] as const;

export const USER_SORT_VALUES = ["name", "email", "createdAt"] as const;

export const USER_SORT_LABELS = {
  createdAt: "Created",
  name: "Name",
  email: "Email",
} satisfies Record<(typeof USER_SORT_VALUES)[number], string>;

export const SORT_ORDERS = ["asc", "desc"] as const;

export const SORT_ORDER_LABELS = {
  asc: "Ascending",
  desc: "Descending",
} satisfies Record<(typeof SORT_ORDERS)[number], string>;
