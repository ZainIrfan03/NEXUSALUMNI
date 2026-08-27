export const ACADEMIC_DEPARTMENT_OPTIONS = [
  { value: "cs", label: "Computer Science", directoryLabel: "Computer Science" },
  { value: "business", label: "Business", directoryLabel: "Business Admin" },
  { value: "engineering", label: "Engineering", directoryLabel: "Mechanical Engineering" },
  { value: "design", label: "Design", directoryLabel: "Visual Design" },
];

export const ACADEMIC_DEPARTMENT_LABELS = Object.fromEntries(
  ACADEMIC_DEPARTMENT_OPTIONS.map(({ value, label }) => [value, label]),
);

export const ALUMNI_DIRECTORY_DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Product",
];

export const INDUSTRY_OPTIONS = [
  "All Industries",
  "Technology",
  "Finance",
  "Healthcare",
  "Law",
];

export const STUDENT_SKILL_OPTIONS = [
  "Python",
  "Data Analysis",
  "UI/UX Design",
  "Public Speaking",
];

export const GRADUATION_YEAR_OPTIONS = ["2024", "2025", "2026", "2027"];

export const STUDENT_DIRECTORY_SORT_OPTIONS = [
  { value: "recent", label: "Recent Activity" },
  { value: "name", label: "Name" },
  { value: "year", label: "Graduation Year" },
];
