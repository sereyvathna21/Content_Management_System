import {
  StartupIcon,
  CommunityIcon,
  PlatformIcon,
  ResearchIcon,
  EnterpriseIcon,
} from "../components/ObjectiveIcons";
import type { Objective } from "../../types/objectives";

export const OBJECTIVES: Objective[] = [
  {
    title: "STARTUP NURTURING",
    description:
      "Nurturing and growing digital startups into successful and sustainable business through startup accelerator programs.",
    color: {
      primary: "from-[#4CAF4F] to-[#2E7D32]",
      bg: "bg-[#E8F6EA]",
      border: "border-[#4CAF4F]",
      text: "text-[#2E7D32]",
      glow: "shadow-[#4CAF4F]/50",
    },
    icon: <StartupIcon />,
  },
  {
    title: "COMMUNITY",
    description:
      "Enhancing positive interaction among stakeholders through various community programs such as meetups, talkshow, documentaries, capacity building activities and networking events.",
    color: {
      primary: "from-[#4CAF4F] to-[#2E7D32]",
      bg: "bg-[#E8F6EA]",
      border: "border-[#4CAF4F]",
      text: "text-[#2E7D32]",
      glow: "shadow-[#4CAF4F]/50",
    },
    icon: <CommunityIcon />,
  },
  {
    title: "DIGITAL PLATFORM",
    description:
      "Developing digital platforms, solutions, and services that startups can plug into and build upon as well as find resources and investors.",
    color: {
      primary: "from-[#4CAF4F] to-[#2E7D32]",
      bg: "bg-[#E8F6EA]",
      border: "border-[#4CAF4F]",
      text: "text-[#2E7D32]",
      glow: "shadow-[#4CAF4F]/50",
    },
    icon: <PlatformIcon />,
  },
  {
    title: "RESEARCH",
    description:
      "Conducting research to gather trusted, accurate data and information that startups and stakeholders can use as resources.",
    color: {
      primary: "from-[#4CAF4F] to-[#2E7D32]",
      bg: "bg-[#E8F6EA]",
      border: "border-[#4CAF4F]",
      text: "text-[#2E7D32]",
      glow: "shadow-[#4CAF4F]/50",
    },
    icon: <ResearchIcon />,
  },
  {
    title: "ENTERPRISES GO DIGITAL",
    description:
      "Aiming to strengthen enterprises' digital capabilities through digital adoption and enable them to become active agents in the digital economy and business.",
    color: {
      primary: "from-[#4CAF4F] to-[#2E7D32]",
      bg: "bg-[#E8F6EA]",
      border: "border-[#4CAF4F]",
      text: "text-[#2E7D32]",
      glow: "shadow-[#4CAF4F]/50",
    },
    icon: <EnterpriseIcon />,
  },
];
