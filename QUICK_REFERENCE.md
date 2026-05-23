# Quick Reference: Adding Class Assignments

## Quick Start (30 seconds)

### Step 1: Update Schedule
Edit `src/data/examSchedule.js`:
```javascript
{ start: "2026-05-10T00:00", end: "2026-05-31T23:59", course: "class_assignments" }
```

### Step 2: Add Assignment Question
Edit `src/data/class_assignments.json`:
```json
{
  "id": 1,
  "type": "class_assignment",
  "category": "OOP",
  "title": "Your Assignment Title",
  "question": "Brief description...",
  "requirements": [
    "Requirement 1",
    "Requirement 2",
    "  - Sub-requirement"
  ],
  "concepts": ["Concept1", "Concept2"],
  "difficulty": "Intermediate"
}
```

## Template (Copy & Paste)

```json
{
  "id": X,
  "type": "class_assignment",
  "category": "Category Here",
  "title": "Assignment Title",
  "question": "What students need to do...",
  "requirements": [
    "Clear requirement 1",
    "Clear requirement 2",
    "  - This is a sub-point under requirement 2",
    "Requirement 3",
    "  - Sub-point 1",
    "  - Sub-point 2"
  ],
  "concepts": ["Concept1", "Concept2", "Concept3"],
  "difficulty": "Beginner|Intermediate|Advanced"
}
```

## Requirements Format

- Main points: No indentation
- Sub-points: Start with `"  - "` (two spaces + dash)
- Max 10-12 requirements for clarity
- Be specific and measurable

## Concept Tags (Examples)
```
Classes, Methods, Loops, Lists, Dictionaries
OOP, Functions, Data Structures, APIs
Inheritance, Polymorphism, Encapsulation
```

## Difficulty Levels
- **Beginner**: For first-time programmers (solo, basic concepts)
- **Intermediate**: For students with some programming experience (2-3 weeks)
- **Advanced**: For experienced programmers (complex logic, multiple files)

## Where Files Are

| File | Path |
|------|------|
| Questions | `src/data/class_assignments.json` |
| Schedule | `src/data/examSchedule.js` |
| Styles | `src/Exam.css`, `src/Result.css`, `src/StudentDashboard.css` |
| Components | `src/components/Exam.js`, `Result.js`, `StudentDashboard.js` |

## Useful Links

- 📚 [Full Guide](./CLASS_ASSIGNMENTS_GUIDE.md)
- 📋 [Implementation Details](./IMPLEMENTATION_SUMMARY.md)
- 🎨 [Styling Reference](src/Exam.css#L170)

## Common Issues

| Problem | Solution |
|---------|----------|
| Assignment not showing | Check date in `examSchedule.js` |
| Styling looks wrong | Clear browser cache (Ctrl+Shift+Del) |
| Code not saving | Check browser console for errors |
| Requirements not displaying | Verify JSON formatting (no trailing commas) |

## JSON Validation

Use [jsonlint.com](https://jsonlint.com) to check your JSON:
```json
{
  "questions": [
    { "id": 1, ... },
    { "id": 2, ... }
  ]
}
```

---

**Quick Reference v1.0** | Last Updated: May 2026
