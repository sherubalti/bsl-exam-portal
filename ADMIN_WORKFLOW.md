# Admin Workflow: Class Assignments

## Complete Workflow

### 🎯 Phase 1: Planning (Before Assignments)
- [ ] Decide which assignments to include
- [ ] Define learning objectives for each
- [ ] Set assignment window dates
- [ ] Estimate time needed per assignment

### 📝 Phase 2: Setup (Create Assignments)
1. Open `src/data/class_assignments.json`
2. Add new assignment to questions array
3. Fill in all required fields:
   - `id`: Unique number
   - `type`: Always `"class_assignment"`
   - `title`: Assignment name
   - `question`: Description/prompt
   - `requirements`: 5-10 specific requirements
   - `concepts`: 3-5 relevant concepts
   - `difficulty`: Beginner/Intermediate/Advanced

### ⏰ Phase 3: Schedule (Make Live)
1. Open `src/data/examSchedule.js`
2. Update the class_assignments slot:
   ```javascript
   { 
     start: "2026-05-XX T00:00", 
     end: "2026-05-XX T23:59", 
     course: "class_assignments" 
   }
   ```
3. Set appropriate duration (120+ minutes recommended)

### 🚀 Phase 4: Launch
1. Deploy changes to server
2. Students see "CLASS ASSIGNMENT" tile on dashboard
3. Students click "Start Assignment" button
4. Students submit code in text editor

### 📊 Phase 5: Review & Grading
1. Go to Admin Dashboard
2. Click "Results" tab
3. Find student submissions
4. Review requirements checklist
5. View submitted code
6. Provide feedback

### ✅ Phase 6: Completion
- [ ] All students attempted assignment
- [ ] Feedback provided
- [ ] Grades recorded
- [ ] Archive assignment details

---

## Quick Tasks

### ❓ How to Add a Single Assignment
**Time: 5 minutes**

1. Copy assignment template from `QUICK_REFERENCE.md`
2. Paste into `class_assignments.json` questions array
3. Update fields: id, title, question, requirements
4. Save file
5. Refresh browser

✅ Done! Assignment appears immediately if schedule is active.

### 🔄 How to Reuse an Old Assignment
1. Go to `class_assignments.json`
2. Find old assignment
3. Copy the entire object
4. Change `id` to new number
5. Update `title` with "- Repeat" or date
6. Modify some requirements if needed
7. Save

### 🗑️ How to Remove an Assignment
1. Open `class_assignments.json`
2. Delete the entire assignment object (including comma)
3. Save file
4. Assignment no longer appears to students

### 🔍 How to Find Student Submissions
1. Admin Dashboard → Results tab
2. Filter by course: "CLASS_ASSIGNMENTS"
3. Click on student to expand submission
4. View their code in the "Submission" section
5. Check against requirements checklist

---

## Assignment Management Checklist

### Creating Assignment
- [ ] Clear title (one sentence max)
- [ ] Description explains what to build
- [ ] 5-10 specific, measurable requirements
- [ ] Each requirement fit on one line
- [ ] Sub-requirements indented with "  - "
- [ ] 3-5 relevant concept tags
- [ ] Difficulty realistic for skill level
- [ ] Unique ID number (increment from previous)
- [ ] `type` set to `"class_assignment"`

### Before Going Live
- [ ] JSON syntax validated (no trailing commas)
- [ ] Schedule dates set correctly
- [ ] Duration sufficient (2+ hours for coding)
- [ ] Test assignment visibility on student dashboard
- [ ] Test submission and storage in Firebase

### While Students Work
- [ ] Monitor submissions in admin panel
- [ ] Check for questions in Discord/Support
- [ ] Don't extend deadline unexpectedly
- [ ] Save backups of submissions

### After Submission Period
- [ ] Review all submissions for completeness
- [ ] Grade based on requirements met
- [ ] Provide constructive feedback
- [ ] Update student records
- [ ] Communicate results to students

---

## Status Indicators

### On Student Dashboard
```
📚 CLASS ASSIGNMENT
Coding Assignments
Complete practical programming tasks...
Available: May 10 - May 31
                              [📝 START ASSIGNMENT]
```

### Active Status Colors
- 🟢 **Green** (SESSION LIVE): Assignment currently available
- 🟡 **Yellow** (ASSIGNMENTS AVAILABLE): Window is active
- ⚫ **Gray** (Scheduled): Coming soon
- ⚪ **Disabled** (Closed): Past due date

---

## Student Experience Flow

```
1. Student logs in
                ↓
2. Sees CLASS ASSIGNMENT tile (purple gradient)
                ↓
3. Clicks "Start Assignment"
                ↓
4. Sees assignment title and requirements
                ↓
5. Sees concepts and difficulty
                ↓
6. Types code in textarea
                ↓
7. Clicks "Submit Assignment"
                ↓
8. Submission saved to Firebase
                ↓
9. Admin reviews in dashboard
```

---

## Common Admin Tasks

### Change Assignment Window
```javascript
// In src/data/examSchedule.js
Before:  end: "2026-05-31T23:59"
After:   end: "2026-06-15T23:59"  // Extended 2 weeks
```

### Add 3 New Assignments Quickly
1. Copy three assignment templates
2. Paste all in `class_assignments.json`
3. Update ids: 4, 5, 6
4. Update titles
5. Update requirements
6. Save once

### Disable Assignments Temporarily
```javascript
// Comment out in examSchedule.js
// { start: "2026-05-10T00:00", end: "2026-05-31T23:59", course: "class_assignments" }
```

### Grade Bulk Submissions
1. Filter assignments by date: "May 23"
2. Open first student
3. Review code against requirements
4. Score out of 10
5. Click next student
6. Repeat until done

---

## Troubleshooting for Admins

| Issue | Cause | Solution |
|-------|-------|----------|
| Assignment not visible | Date/time outside window | Check `examSchedule.js` dates |
| Can't add assignment | JSON syntax error | Validate in jsonlint.com |
| Code not submitted | Student browser issue | Ask student to refresh page |
| Requirements not showing | Indentation incorrect | Use "  - " (2 spaces + dash) |
| Multiple assignments showing | Course set wrong | Ensure `course: "class_assignments"` |

---

## Best Practices

### ✅ DO
- Use specific, measurable requirements
- Make titles clear and descriptive
- Include examples in question description
- Set realistic timeframes
- Review submissions promptly
- Provide actionable feedback
- Archive completed assignments

### ❌ DON'T
- Use vague requirements ("make it work")
- Set unrealistic time limits (<60 min)
- Have more than 10 requirements per assignment
- Forget to set end date
- Change assignment mid-window
- Leave submissions unreviewed indefinitely

---

## Documentation Files

| File | Purpose |
|------|---------|
| `CLASS_ASSIGNMENTS_GUIDE.md` | Full comprehensive guide |
| `QUICK_REFERENCE.md` | Templates and quick lookup |
| `IMPLEMENTATION_SUMMARY.md` | Technical implementation details |
| `README.md` | Project overview (updated) |

---

**Admin Workflow v1.0** | Last Updated: May 23, 2026
