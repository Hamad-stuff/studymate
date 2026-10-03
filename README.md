# StudyMate — Smart Academic Companion

## Problem Statement

University students manage attendance, assignment deadlines, and academic
progress across separate systems or manually. This makes it difficult to:
- Identify courses requiring attendance attention
- Prioritise upcoming assignments
- Determine how many future classes are needed to recover attendance
- Get a unified academic overview in one place

StudyMate solves this by combining all academic tracking into a single,
smart mobile application.

---

## Features

### Dashboard
- Greeting based on time of day
- 4 summary cards: Courses, Overall Attendance, Pending, Completed
- Dynamic academic alert/warning system
- Attendance bar chart (per course)
- Assignment status pie chart (Completed / Pending / Overdue)
- Upcoming assignments this week
- Courses needing attention section
- All data derived from state — updates automatically

### Attendance
- List all courses with attendance percentage and status badge
- Progress bar with threshold marker
- Quick actions: Attended +1, Missed +1
- Add / Edit / Delete courses
- Live attendance percentage preview in form
- Full validation

### Assignments
- Filter tabs: All | Pending | Completed | Overdue
- Intelligent sort: Overdue → Pending (by date) → Completed
- Add assignments with title, course picker, date picker
- Mark complete / mark pending toggle
- Delete with confirmation
- Per-filter empty states
- Full validation

### Recovery Calculator
- 3-step interface: Course → Target → Expected Absences
- Quick preset buttons for common targets (75%, 80%, 85%, 90%)
- Live current attendance bar for selected course
- Formula: x ≥ [R(T+m) - A] / (1 - R)
- Result card with breakdown table
- Handles all edge cases: already achieved, impossible, 100%, negative

### Settings
- Attendance threshold: preset buttons + manual input
- Live impact preview showing how many courses are affected
- Current data overview (course count, assignment count)
- Reset to demo data (with confirmation)
- Clear all data (with confirmation)
- About section

---

## Technologies

- **React Native** — Mobile UI framework
- **JavaScript (ES6+)** — Application logic
- **Expo SDK 57** — Development and build platform
- **react-native-chart-kit** — Bar chart and Pie chart
- **react-native-svg** — SVG rendering for charts

---

## Architecture


StudyMate/
├── App.js State owner, view switcher
├── components/ Reusable UI components
│ ├── AppHeader.js Header + dropdown navigation
│ ├── AssignmentCard.js Single assignment display
│ ├── ChartCard.js Chart wrapper card
│ ├── DatePickerField.js Custom date picker
│ ├── EmptyState.js Empty data display
│ ├── FormInput.js Labeled input with error
│ ├── PrimaryButton.js Reusable button (4 variants)
│ ├── SummaryCard.js Dashboard metric card
│ └── WarningCard.js Alert/warning card
├── screens/ Full screen views
│ ├── DashboardScreen.js Academic overview
│ ├── AttendanceScreen.js Course attendance management
│ ├── AssignmentsScreen.js Assignment planner
│ ├── RecoveryScreen.js Attendance recovery calculator
│ └── SettingsScreen.js App settings
├── data/ Sample data
│ ├── initialCourses.js 5 sample courses
│ └── initialAssignments.js 7 sample assignments
├── utils/ Pure calculation functions
│ ├── attendanceUtils.js Attendance calculations
│ ├── assignmentUtils.js Assignment helpers + sorting
│ ├── recoveryUtils.js Recovery formula
│ ├── dateUtils.js Date formatting
│ └── validationUtils.js Form validation
└── theme/
└── theme.js Colors, fonts, spacing, shadow

text

---

## React Concepts Demonstrated

| Concept | Where Used |
|---------|-----------|
| Functional Components | Every component and screen |
| useState | App.js (4 state values), all screen-level UI state |
| useMemo | Dashboard derived values, Assignments filter+sort |
| Props | Every component receives typed props |
| Callbacks | setCourses, setAssignments passed as props |
| Conditional rendering | Empty states, modals, warnings, chart guards |
| Data-driven UI | map() renders all lists, charts, warning cards |
| Events | onPress, onChangeText throughout |

---

## JavaScript Concepts Demonstrated

| Concept | Where Used |
|---------|-----------|
| Arrays | courses[], assignments[] — primary data |
| Objects | Course and assignment data models |
| map() | Render lists, build chart data, immutable updates |
| filter() | Filter assignments, find at-risk courses |
| reduce() | countByStatus(), calculateOverallAttendance() |
| find() | Course lookup in recovery screen |
| sort() | sortAssignments() with priority object |
| Spread ... | Immutable state: [...prev, new], {...obj, field: val} |
| Arrow functions | All utilities and handlers |
| Destructuring | const { valid, error } = validateCourse(...) |
| Template literals | IDs, messages, date strings |
| parseInt/parseFloat | Form input parsing |
| Math.min/ceil/abs | Attendance cap, recovery rounding, overdue days |
| isNaN/isFinite | Chart safety guards |
| Ternary | Status colors, day text, conditional labels |

---

## Validation

All forms validate before submission:
- Course: name not empty, numbers valid, attended ≤ total, total > 0
- Assignment: title not empty, course selected, date valid YYYY-MM-DD
- Recovery: target 0–100, future missed ≥ 0, both numeric
- Error messages displayed inline, cleared on field change

---

## Setup and Running

### Prerequisites
- Node.js 18+
- Expo Go app on your phone

### Installation

```bash
# Create project
npx create-expo-app StudyMate --template blank
cd StudyMate

# Install dependencies
npx expo install react-native-chart-kit react-native-svg

# Copy all source files into the project directory
# (replace App.js and create all folders/files as listed above)

# Start
npx expo start

Scan the QR code with Expo Go on Android or iOS.

AI Usage

This application was developed with AI assistance (Claude). The AI was used for:

Code generation for components, screens, and utilities
Debugging layout and logic issues
Explaining React and JavaScript concepts
Generating consistent styling across components

All generated code was reviewed, tested, and understood before submission.
The architecture decisions, feature selection, data models, and design
choices were made by the student based on the assignment requirements.

Known Limitations
Data is not persisted between app restarts (no AsyncStorage)
DatePickerField scroll columns do not auto-scroll to selected value
The gap style property requires React Native 0.71+ / Expo SDK 49+
No assignment editing (only add/delete/toggle) — satisfies requirements
text

---
