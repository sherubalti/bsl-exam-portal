# Class Assignments Management Guide

## Overview
The BSL Exam Portal now supports **Class Assignments** - a specialized question type for submitting practical coding assignments and projects. This guide explains how to manage class assignments for your students.

## Features

### For Students
- **Visual Assignment Tiles**: Class assignments appear as special purple/gradient tiles on the Student Dashboard
- **Expandable Requirements**: Each assignment displays:
  - Title and description
  - Detailed requirements checklist
  - Key concepts covered
  - Difficulty level
- **Code Editor**: Students get a dedicated text area to write and submit their Python code solutions
- **Submission Tracking**: Assignment submissions are recorded with timestamp and student information

### For Admins
- **Schedule Management**: Add assignment windows to the exam schedule
- **Custom Questions**: Define detailed assignment questions with requirements
- **Submission Review**: View student submissions in the admin dashboard
- **Flexible Grading**: Mark assignments as submitted and review code later

## How to Add Class Assignments

### Step 1: Update Exam Schedule
Edit `src/data/examSchedule.js`:

```javascript
const examSchedule = {
  duration: 120, // 2 hours for assignments
  slots: [
    // ... existing slots ...
    { 
      start: "2026-05-10T00:00", 
      end: "2026-05-31T23:59", 
      course: "class_assignments" 
    }
  ]
};
```

**Parameters:**
- `start`: When assignments become available (ISO 8601 format)
- `end`: When assignment window closes
- `course`: Must be set to `"class_assignments"`
- `duration`: Time allocated for completion (in minutes)

### Step 2: Add Assignment Questions
Edit or create `src/data/class_assignments.json`:

```json
{
  "questions": [
    {
      "id": 1,
      "type": "class_assignment",
      "category": "Object-Oriented Programming",
      "title": "Student Performance Analysis System",
      "question": "Design a Python-based system for analyzing student performance in a class.",
      "requirements": [
        "Store student data using appropriate data types (list, dictionary)",
        "Each student should have: Name (string), Marks of 4 subjects (list of integers)",
        "Create a class named StudentAnalysis that handles all operations",
        "The class should include the following methods:",
        "  - A method to add student data (name and marks)",
        "  - A method to calculate average marks using a loop",
        "  - A method to find maximum and minimum marks using loops",
        "  - A method to find the top-performing student based on average marks",
        "  - A method to display a full report of all students",
        "Use loops for calculations",
        "Use functions inside a class",
        "Use proper data structures (list + dictionary)"
      ],
      "concepts": ["Classes", "Methods", "Loops", "Lists", "Dictionaries", "Data Structures"],
      "difficulty": "Intermediate"
    }
  ]
}
```

**JSON Structure:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier for the assignment |
| `type` | string | Must be `"class_assignment"` |
| `category` | string | Topic/category (e.g., "OOP", "Data Structures") |
| `title` | string | Assignment title (shown on screen) |
| `question` | string | Introductory text/description |
| `requirements` | array | Array of requirement strings (use `"  - "` prefix for sub-points) |
| `concepts` | array | List of key concepts/tags |
| `difficulty` | string | "Beginner", "Intermediate", or "Advanced" |

### Step 3: Verify on Student Dashboard
The assignment will now appear as a special tile on the Student Dashboard during the active window:

```
📚 CLASS ASSIGNMENT

Coding Assignments
Complete practical programming tasks and submit your solutions

Available: [Date/Time] — [Date/Time]

[📝] [START ASSIGNMENT]
```

## Managing Submissions

### Viewing Student Submissions
1. Go to Admin Dashboard
2. Click on "Results" tab
3. Find the student's assignment submission
4. Review their code solution in the details

### Assignment Submission Data
Each submission includes:
- Student name and email
- Submission timestamp
- Full code/solution text
- Assignment title and requirements
- Assignment concepts and difficulty

## Example Assignments

### 1. Banking System
```json
{
  "id": 2,
  "type": "class_assignment",
  "category": "Object-Oriented Programming",
  "title": "Banking Management System",
  "question": "Create a Python banking system using OOP principles.",
  "requirements": [
    "Create Account class with balance, account number, owner name",
    "Implement deposit() and withdraw() methods",
    "Create Bank class to manage multiple accounts",
    "Add interest calculation for savings accounts",
    "Implement transaction history tracking",
    "Add validation for minimum balance rules"
  ],
  "concepts": ["Classes", "Methods", "Inheritance", "Encapsulation"],
  "difficulty": "Intermediate"
}
```

### 2. Data Analysis Task
```json
{
  "id": 3,
  "type": "class_assignment",
  "category": "Data Analysis",
  "title": "Student Grade Analysis",
  "question": "Analyze student performance data and generate insights.",
  "requirements": [
    "Read student data from a dictionary",
    "Calculate average grades using loops",
    "Find top and bottom performers",
    "Generate performance report",
    "Create grade distribution summary"
  ],
  "concepts": ["Dictionaries", "Loops", "Functions", "Data Analysis"],
  "difficulty": "Beginner"
}
```

## Frontend Display

### Assignment Card Layout
```
┌─────────────────────────────────────────┐
│ 📚 CLASS ASSIGNMENT                     │
│ Coding Assignments                      │
│ Complete practical programming tasks... │
│ Available: May 10 - May 31              │
│                              [📝 START] │
└─────────────────────────────────────────┘
```

### Assignment Question View
```
CATEGORY: Object-Oriented Programming

Student Performance Analysis System

Design a Python-based system...

Requirements:
✓ Store student data using...
  → Each student should have...
✓ Create a class named...
  → The class should include...

Key Concepts: [Classes] [Methods] [Loops] [Lists]

Difficulty: Intermediate

Your Solution:
┌────────────────────────────┐
│ class StudentAnalysis:     │
│     def __init__(self):    │
│         ...                │
└────────────────────────────┘
```

## Best Practices

### For Assignment Design
1. ✅ Make requirements clear and specific
2. ✅ Include 5-10 distinct requirements per assignment
3. ✅ Use sub-bullets (with `"  - "` prefix) for related requirements
4. ✅ Set realistic difficulty levels
5. ✅ Include relevant concepts for searchability

### For Time Management
1. ✅ Allocate 2 hours (120 minutes) minimum for assignments
2. ✅ Set end date at least 2 weeks after start date
3. ✅ Consider student skill level when setting duration

### For Grading
1. ✅ Review submissions for code quality, not just correctness
2. ✅ Check that students meet all requirements
3. ✅ Provide feedback on their submissions
4. ✅ Track completion rates

## Technical Details

### Question Types Supported
- **MCQ**: Multiple choice questions (default)
- **class_assignment**: Coding assignment submissions

### Storage
- Assignments are stored in `src/data/class_assignments.json`
- Student submissions are stored in Firebase under `examResults`
- Each submission includes the full code and timestamp

### Rendering
- Assignment questions use special HTML rendering with requirements list
- Students see a code editor textarea for code input
- Results view shows both MCQ answers and assignment code

## Troubleshooting

### Assignment Not Appearing?
1. Check `examSchedule.js` - ensure `course: "class_assignments"` is set
2. Verify current time is within the start/end window
3. Clear browser cache and reload
4. Check browser console for errors

### Submission Not Saving?
1. Ensure Firebase is connected
2. Check student email format (special characters are handled)
3. Verify textarea has content before submit
4. Check network connectivity

### Styling Issues?
- Check `src/Exam.css` for assignment-specific styles
- Verify `StudentDashboard.css` has class-assignment styles
- Clear CSS cache if styles don't update

## API Integration

### Adding to Your Backend
If you want to auto-grade assignments, create an endpoint that:

```javascript
// Example: /api/gradeAssignment
const gradeAssignment = (studentCode, assignmentId) => {
  // Use AI/LLM or custom logic to evaluate code
  // Check if requirements are met
  // Return score and feedback
};
```

## Future Enhancements

Potential features to add:
- [ ] Auto-grading with unit tests
- [ ] Code quality analysis
- [ ] Plagiarism detection
- [ ] Peer review system
- [ ] Assignment templates
- [ ] Submission rubrics
- [ ] Code syntax highlighting

---

**Version**: 1.0  
**Last Updated**: May 2026  
**Created for**: BSL Exam Portal
