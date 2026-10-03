// =============================================================================
// data/initialCourses.js
// Sample course data loaded on first launch and restored on demo reset.
// attendedClasses + totalClasses = single source of truth.
// Attendance percentage is ALWAYS calculated — never stored.
// =============================================================================

const initialCourses = [
  {
    id:              "course-1",
    name:            "Cloud Computing",
    attendedClasses: 14,
    totalClasses:    20,
  },
  {
    id:              "course-2",
    name:            "Information Security",
    attendedClasses: 11,
    totalClasses:    18,
  },
  {
    id:              "course-3",
    name:            "Formal Methods",
    attendedClasses: 17,
    totalClasses:    19,
  },
  {
    id:              "course-4",
    name:            "Generative AI",
    attendedClasses: 13,
    totalClasses:    20,
  },
  {
    id:              "course-5",
    name:            "Software for Mobile Devices",
    attendedClasses: 15,
    totalClasses:    18,
  },
];

export default initialCourses;
