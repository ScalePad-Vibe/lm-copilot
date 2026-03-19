import { RocketLaunchIcon, FlagIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

/** Top-level nav tools — single source of truth used by AppSidebar + Home */
export const NAV_TOOLS = [
  {
    path: "/initiatives",
    icon: RocketLaunchIcon,
    label: "Initiatives Manager",
    category: "Planning",
    description:
      "View, configure, and deploy initiatives across multiple clients simultaneously with real-time progress tracking.",
  },
  {
    path: "/goals",
    icon: FlagIcon,
    label: "Goals Manager",
    category: "Planning",
    description:
      "Build goal templates and deploy them across your client base — status, period, and description in one step.",
  },
  {
    path: "/opportunities",
    icon: CurrencyDollarIcon,
    label: "Opportunities",
    category: "Reporting",
    description:
      "Pull live sales opportunities from the ScalePad API and filter by client, stage, or opportunity name.",
  },
] as const;
