// =============================================================================
// data/initialAssignments.js
// Sample assignment data loaded on first launch and restored on demo reset.
// dueDate: "YYYY-MM-DD" string — always stored in this format.
// completed: boolean — only persistent status field.
// "overdue" is calculated from dueDate + completed. Never stored.
// =============================================================================

const initialAssignments = [
  {
    id:         "assignment-1",
    title:      "Cloud Infrastructure Report",
    courseName: "Cloud Computing",
    dueDate:    "2026-09-25",
    completed:  false,
  },
  {
    id:         "assignment-2",
    title:      "Encryption Algorithm Analysis",
    courseName: "Information Security",
    dueDate:    "2026-09-18",
    completed:  false,
  },
  {
    id:         "assignment-3",
    title:      "Formal Proof Submission",
    courseName: "Formal Methods",
    dueDate:    "2026-09-10",
    completed:  true,
  },
  {
    id:         "assignment-4",
    title:      "Generative Model Comparison",
    courseName: "Generative AI",
    dueDate:    "2026-09-30",
    completed:  false,
  },
  {
    id:         "assignment-5",
    title:      "React Native App Prototype",
    courseName: "Software for Mobile Devices",
    dueDate:    "2026-09-20",
    completed:  false,
  },
  {
    id:         "assignment-6",
    title:      "Security Audit Report",
    courseName: "Information Security",
    dueDate:    "2026-08-28",
    completed:  true,
  },
  {
    id:         "assignment-7",
    title:      "Cloud Cost Optimization Study",
    courseName: "Cloud Computing",
    dueDate:    "2026-09-05",
    completed:  false,
  },
];

export default initialAssignments;
