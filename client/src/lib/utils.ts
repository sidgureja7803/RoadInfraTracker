import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "₹", decimals = 1): string {
  return `${currency}${value.toFixed(decimals)} Cr`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "text-green-800 bg-green-100";
    case "in_progress":
      return "text-amber-800 bg-amber-100";
    case "scheduled":
      return "text-blue-800 bg-blue-100";
    case "delayed":
      return "text-red-800 bg-red-100";
    default:
      return "text-slate-800 bg-slate-100";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500";
    case "in_progress":
      return "bg-amber-500";
    case "scheduled":
      return "bg-blue-500";
    case "delayed":
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
}

export function getProgressStatusText(project: { status: string; progress: number }): { text: string; color: string } {
  const { status, progress } = project;

  if (status === "scheduled" && progress === 0) {
    return { text: "Starts soon", color: "text-blue-600" };
  } else if (status === "in_progress" && progress > 75) {
    return { text: "Almost complete", color: "text-green-600" };
  } else if (status === "in_progress" && progress < 25) {
    return { text: "Just started", color: "text-blue-600" };
  } else if (status === "delayed") {
    return { text: "Delayed", color: "text-red-600" };
  } else if (status === "completed") {
    return { text: "Completed", color: "text-green-600" };
  } else {
    return { text: "On schedule", color: "text-green-600" };
  }
}

export function generateProjectId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `PRJ-${year}-${randomNum}`;
}

export function generateRoadId(): string {
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `MG-R-${randomNum}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
