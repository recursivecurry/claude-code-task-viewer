export const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export const STATUS_BORDER: Record<string, string> = {
  pending: "border-yellow-400",
  in_progress: "border-blue-400",
  completed: "border-green-400",
};

export const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-400",
  in_progress: "bg-blue-400",
  completed: "bg-green-400",
};
