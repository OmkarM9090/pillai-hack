# Roles, Access and Command Hierarchy

## Roles
### General Manager
Full resort overview, strategic approvals, high-impact actions.

### Operations Manager
Cross-department coordination, daily operations, escalations.

### Front Desk / Guest Relations
Check-in/out, room assignment, guest requests, complaints, concierge.

### Housekeeping Manager/Supervisor
Room status, cleaning allocation, housekeeping workforce.

### Housekeeping Staff
Assigned room/service tasks only.

### Engineering Manager
Maintenance, assets, preventive maintenance, vendors.

### Technician
Assigned maintenance tasks only.

### Executive Chef / F&B Manager
Menu, kitchen capacity, food safety workflow, inventory, demand.

### Kitchen Staff / Restaurant Staff
Orders, preparation, service tasks, shift information.

### Procurement Manager
Suppliers, purchase recommendations, purchase orders.

### Revenue Manager
Pricing rules, demand, revenue simulations and approvals within policy.

### HR Manager
Workforce records, staffing, training, conflicts, employment workflows.

### Security Manager
Safety incidents, security tasks, emergency escalation.

### Medical/First-Aid Role
Incident intake and response within professional scope.

### Finance
Costs, payment records, budgets, approved workforce/payment data.

### Temporary Worker
Own profile, availability, shifts, tasks, check-in/out, feedback.

### Staffing Agency
Open staffing requests, candidate submission, worker status.

### Guest
Own stay, preferences, requests, bookings, feedback, emergency information.

### AI Engine
Prediction, classification, simulation, recommendation and explanation. No unilateral high-risk decisions.

## Command hierarchy
General Manager
→ Operations Manager
→ Department Managers
→ Supervisors
→ Staff

AI sits beside the hierarchy:
AI recommendation → authorized manager → approve/modify/reject → task/action.

## RBAC rules
- Least privilege
- Guest sees own information
- Staff sees assigned/necessary operational data
- Chef sees food-service data, not employee salaries
- Temporary workers see their shift/tasks, not guest private records
- Finance sees financial records needed for their role
- HR sees employment records
- Sensitive information is compartmentalized
- Audit every privileged action
