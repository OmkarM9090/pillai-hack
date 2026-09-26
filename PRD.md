# Smart Resort 360 — Product Requirements Document (PRD)

**Project:** Smart Resort 360 — AI-Powered Resort Operations, Guest Experience & Revenue Intelligence  
**PS ID:** 4  
**Team:** Tech Tantra  
**Build Window:** 24-hour hackathon MVP  
**Document Status:** Implementation-ready / Scope-locked  
**Primary Product Name:** Smart Resort 360  
**Internal Concept Name:** ResortSandbox 360  
**Version:** 1.0  
**Last Updated:** 26 September 2026

---

## 1. Executive Summary

Smart Resort 360 is a unified resort decision-intelligence platform that connects operational state, guest signals, workforce capacity, inventory, maintenance, pricing, and external conditions into one decision loop.

The product is deliberately **not a passive dashboard**. The core experience is:

> **SENSE → PREDICT → SIMULATE → DECIDE → APPROVE → ACT → VERIFY → LEARN**

The platform maintains a shared **Digital Twin** of the resort. New operational or world signals update the twin. Prediction models estimate future demand and operational load. A forward simulator evaluates counterfactual scenarios. A reverse simulator determines the **maximum safe operating capacity** under current resource constraints. Specialist AI agents reason over the same state and produce a coordinated action plan. A human approval gate prevents unsafe or unreviewed actions from being executed. Approved decisions update operational state and are logged so actual outcomes can be compared with predictions.

The 24-hour MVP is intentionally focused on a small number of deeply connected capabilities rather than a large number of shallow screens. The demo spine must prove that one event — for example, an occupancy surge combined with bad weather and staffing/inventory constraints — can propagate across departments and result in one coordinated, human-approved operational response.

The PS4 challenge asks teams to use AI, analytics, and intelligent automation to improve resort operations, guest experience, or revenue management, and explicitly encourages intelligent staff scheduling, predictive maintenance, inventory optimization, personalization, sentiment analysis, dynamic pricing, guest segmentation, and actionable recommendations/workflows. This PRD converts those expectations into one coherent product.

---

## 2. Product Vision

### 2.1 Vision Statement

Smart Resort 360 should become the resort manager’s operational decision layer:

> **See what is changing, understand what it will affect, simulate the consequences, decide what to do, approve the plan, execute the changes, and measure the result — all from one connected resort state.**

### 2.2 Product Promise

When demand, weather, staffing, guest complaints, inventory, maintenance, or supplier conditions change, the system should answer five questions:

1. **What is happening now?**
2. **What is likely to happen next?**
3. **What breaks first if nothing changes?**
4. **What coordinated action should the resort take?**
5. **What happened after the decision, and what should the system learn from it?**

### 2.3 Product North Star

A manager should be able to move from **signal → predicted impact → simulated trade-off → recommended action → human approval → measurable outcome** without leaving the product.

---

## 3. Problem Statement

Modern resorts operate across fragmented sources:

- bookings and occupancy
- room readiness and housekeeping
- staff availability and rosters
- guest requests and complaints
- food and beverage demand
- pantry and inventory
- suppliers and procurement
- equipment and maintenance
- pricing and revenue
- guest reviews and feedback
- external conditions such as weather and local events

The PS4 problem statement states that this fragmentation makes it difficult for resort managers to understand the current state in real time, anticipate problems, personalize services, allocate resources efficiently, and make timely revenue decisions.

A passive reporting layer is not enough. The product must demonstrate how AI/analytics turns resort data into **predictions, recommendations, alerts, and workflows**.

---

## 4. Target Users & Personas

### 4.1 Primary Persona — General Manager (GM)

**Example persona:** Sarah

**Responsibilities**
- overall resort performance
- service quality
- labor budget
- revenue performance
- risk and safety
- cross-department decisions

**Current pain**
- firefighting after a problem occurs
- fragmented information
- hidden dependencies between departments
- difficulty knowing the safe operating ceiling during demand surges

**Core product actions**
- monitor command center
- open the Resort Time Machine
- inspect Safe Operating Envelope
- review Decision Council reasoning
- approve / reject / modify action cards
- monitor resulting KPI changes
- review audit trail

### 4.2 Revenue Manager

**Example persona:** Marco

**Responsibilities**
- occupancy and booking pace
- room-rate strategy
- demand elasticity
- revenue performance

**Pain**
- pricing decisions can be made without visibility into labor, housekeeping, kitchen, or guest-service constraints

**Core product actions**
- inspect demand forecast
- simulate rate/occupancy scenarios
- review bounded dynamic pricing suggestions
- inspect revenue vs operational-risk trade-offs

### 4.3 Department Supervisors

**Departments**
- Housekeeping
- F&B
- Facilities / Engineering

**Core product actions**
- accept and complete tasks
- inspect department bottlenecks
- manage operational tickets
- review rosters
- hand over unresolved issues

### 4.4 Frontline Staff

**Examples**
- housekeepers
- servers
- engineers
- front-office staff

**Core actions**
- view assigned shift
- acknowledge reallocation
- view task changes
- update task status
- receive notifications

### 4.5 Future / Extended Roles

- Corporate / multi-property operations
- procurement lead
- security / compliance lead
- guest-relations lead
- staffing-agency partner

These are not required for the 24-hour MVP.

---

## 5. Product Principles

### 5.1 Action over Visualization

Every important metric should answer:
- What changed?
- Why does it matter?
- What should we do?

### 5.2 One Shared State

All modules operate on the same Digital Twin state. Occupancy is not a dashboard-only number; a change in occupancy must propagate into staffing, housekeeping, F&B, guest experience, revenue, and risk.

### 5.3 Numbers Come from Models / Rules

Specialist AI agents must not invent quantitative values. Numeric forecasts, capacity values, simulation outcomes, and optimization results come from the ML / deterministic computation layer. Agents interpret, reconcile, and explain those results.

### 5.4 Human Approval for Impactful Actions

High-impact or low-confidence AI recommendations must never silently modify operational state.

### 5.5 Graceful Degradation

No critical demo flow should depend on one network call, model, or external API.

### 5.6 Demo-First Scope Discipline

The 24-hour product must prioritize connected depth:
- Digital Twin
- Forecasting
- What-If simulation
- Safe Capacity / Reverse Time Machine
- Decision Council
- Approval
- Guest-review-to-ticket workflow
- Roster reallocation
- Audit / outcome loop

---

## 6. PS4 Requirement Coverage

The product must explicitly cover the following challenge areas from PS4.

| PS4 Expected Capability | Smart Resort 360 Coverage | MVP Priority |
|---|---|---|
| Intelligent staff scheduling | Co-optimized roster generator using predicted workload, skills, availability, and fatigue constraints | Must |
| Predictive maintenance | Maintenance anomaly detection + review-driven maintenance ticket routing | Strong MVP / Tier 2 |
| Inventory optimization | Booking-aware pantry depletion and reorder alerts; Plate-to-Pantry loop | Must / Strong |
| Personalized guest experience | Guest segmentation, preference-aware hints, service recommendations | Tier 2 |
| AI concierge / guest request handling | Guest request intake + intelligent routing is supported conceptually; full conversational concierge is future scope | Future |
| Guest sentiment analysis | ABSA using Gemini with local fallback | Must |
| Dynamic pricing | Demand-aware room and menu pricing within explicit clamps | Must |
| Guest segmentation | KMeans-based segmentation feeding personalization hints | Strong |
| Actionable recommendations / automation | Decision Council, Action Cards, approvals, roster updates, tickets, alerts, PO drafts | Must |
| Multi-area integrated decision support | Digital Twin + cross-department simulation | Must |
| Beyond dashboard | Closed-loop execution and learning | Must |

The PRD intentionally keeps full AI concierge conversational UX outside the 24-hour critical path while preserving a clear extension point.

---

## 7. Product Scope

### 7.1 Tier 1 — Must Work

1. Role-based login / persona selector
2. Resort Command Center
3. Shared Digital Twin state
4. Occupancy / demand forecast
5. Resort Time Machine (forward simulation)
6. Safe Operating Envelope (reverse simulation)
7. AI Decision Council + Chief Decision Agent
8. Swipe Approval Queue
9. Review Intelligence + ABSA + auto-ticket routing
10. Roster scheduling / cross-department reallocation
11. Audit trail / approval history
12. Deterministic fallbacks

### 7.2 Tier 2 — Strong Additions

1. Plate-to-Pantry F&B loop
2. Predictive maintenance anomaly flags
3. Guest segmentation
4. World Pulse panel
5. Shift handover summary
6. Notifications center
7. Bottleneck heatmap
8. Resort Resilience / Stress Score
9. Proactive maintenance pattern detection
10. Guest apology-credit engine

### 7.3 Tier 3 — Architecture Stubs / Future

1. Public-health / regulatory alerts
2. Staffing marketplace integrations
3. Multi-property console
4. Direct PMS/POS write-back webhooks
5. IoT HVAC / room sensor integration
6. Autonomous portfolio optimization

### 7.4 Scope Rule

If implementation pressure occurs, the team must preserve the Tier-1 decision loop and reduce surface area elsewhere.

Recommended cut order:
1. WebSockets → keep HTTP polling
2. Five-ingredient pantry loop → keep Fresh Salmon only
3. Broad cross-training → keep Spa ↔ Front Office or one clear staff transfer route
4. Live weather selector → allow a deterministic demo weather state
5. Non-essential animations and secondary analytics

---

## 8. Core User Journey

### Journey A — Occupancy Surge → Coordinated Decision

**Trigger**

Booking pickup accelerates, moving projected occupancy from approximately 70–82% toward 95%.

**Flow**

1. New booking signal enters the system.
2. Digital Twin occupancy state updates.
3. Command Center shows a surge alert.
4. Forecasting model estimates future occupancy and labor requirements.
5. Manager opens the Resort Time Machine.
6. Manager increases occupancy slider and optionally adds storm / inflation conditions.
7. Simulation propagates the scenario to:
   - GOPPAR
   - room readiness / housekeeping lag
   - staff burnout
   - F&B wait
   - inventory consumption
   - guest service score
8. Reverse Time Machine calculates the safe operating ceiling from current staff and inventory.
9. Specialist agents inspect the same simulated state.
10. Chief Decision Agent produces one coordinated Action Card.
11. Card enters the human approval queue.
12. Manager approves, rejects, or modifies the plan.
13. Approved actions update rosters / rates / tasks / notifications.
14. Execution is audit logged.
15. Actual outcomes are captured for verification and future learning.

**Demo outcome**

The judge should visibly see that one occupancy change causes cross-department consequences and that the system converts the consequences into one actionable decision.

---

### Journey B — Guest Review → Maintenance Workflow

**Trigger**

Guest submits a review such as:

> “AC in Room 304 is rattling and leaking.”

**Flow**

1. Review text is received.
2. Gemini ABSA parses aspect, sentiment/polarity, confidence, and key terms.
3. Local TF-IDF / rule-based fallback runs when Gemini is unavailable.
4. Relevant words are highlighted in the original text.
5. System maps the issue to Engineering.
6. Ticket is created with priority, SLA, room/asset, and source.
7. Ticket appears on Facilities Kanban.
8. Staff move ticket from To Do → In Progress → Completed.
9. Repeated failure patterns are accumulated for preventive-maintenance recommendations.

**Demo outcome**

The judge sees unstructured guest feedback become a concrete operational work order rather than a static sentiment chart.

---

### Journey C — Safe Operating Envelope

**Trigger**

Management asks:

> “Given today’s active staff and pantry stock, how much occupancy can we safely handle?”

**Flow**

1. Manager opens Safe Operating Envelope.
2. Inputs are loaded from the Digital Twin.
3. Engine evaluates resource constraints.
4. System computes maximum safe occupancy.
5. If projected demand exceeds that ceiling, the system shows the resource gap.
6. The system proposes the smallest actionable additions required to unlock more capacity.

Example:
- safe ceiling: 82%
- projected demand: 95%
- gap: housekeeping hours + pantry stock
- recommended response: staffing transfer + replenishment + bounded rate change

---

### Journey D — Human Approval → Execution

**Trigger**

An Action Card is generated.

**Flow**

1. Action Card contains situation, evidence, impact, options, recommendation, confidence, risk, and rollback plan.
2. Decision is marked “Requires approval” when:
   - confidence is below threshold, or
   - impact is high, or
   - action touches safety / employment / material pricing decisions.
3. Manager reviews evidence.
4. Manager:
   - approves
   - rejects
   - modifies
5. System records:
   - approver
   - timestamp
   - action
   - model/version
   - confidence
   - changed state
   - reason for rejection/modification
6. State update is applied.
7. Affected staff receive a notification.
8. Result enters the learn/verify stage.

---

## 9. Core Feature Requirements

## 9.1 Authentication & Role Gate

### Goal
Allow the demo to switch between GM, Revenue Manager, Supervisor, and Staff perspectives.

### Functional Requirements
- FR-AUTH-01: System must expose a role selector at login.
- FR-AUTH-02: Every state-changing API operation must validate the active role.
- FR-AUTH-03: Unauthorized role actions must return a clean authorization error.
- FR-AUTH-04: UI should hide or disable controls that the role is not expected to use.
- FR-AUTH-05: Audit log must record the role associated with each approved or rejected action.

### MVP Security Model
Use a lightweight role gate for the hackathon. Production upgrade path is JWT + RBAC + MFA.

---

## 9.2 Command Center

### Goal
Give management a real-time operational overview with immediate next actions.

### Required KPIs
- Occupancy
- GOPPAR
- Burnout risk
- Service score
- Housekeeping turnover lag
- F&B wait time
- critical inventory alerts
- open maintenance tickets
- active risk alerts

### Required UI
- KPI cards
- alert banner
- bottleneck indicators
- current Digital Twin health
- predicted next-period risks
- recommended actions
- quick navigation to Time Machine and Approval Queue

### Rule
Command Center must not become a static analytics page. At least one visible recommendation or action should be accessible from the dashboard.

---

## 9.3 Digital Twin

### Goal
Maintain a shared operational representation of the resort.

### Required Twin Domains

**Rooms**
- total rooms
- occupied
- available
- cleaning
- ready
- maintenance
- out-of-order

**Guests**
- arrivals
- departures
- preferences
- requests
- feedback
- segmentation

**Workforce**
- roster
- skills
- cross-training coefficients
- fatigue
- overtime

**F&B**
- demand forecast
- ingredient stock
- kitchen capacity
- supplier status

**Maintenance**
- assets
- open tickets
- failure history
- anomaly score

**Revenue**
- rate
- booking pace
- demand
- GOPPAR

**Safety**
- incidents
- active risk flags
- weather signals

### State Propagation Requirement

Changing one high-level variable must visibly affect dependent modules.

Example:
**Occupancy 82% → 95%**
- increases room turnover demand
- increases housekeeping load
- increases F&B demand
- reduces pantry stock faster
- increases staff pressure
- potentially increases guest waiting
- creates a revenue opportunity
- increases service risk

---

## 9.4 Demand & Occupancy Forecasting

### Goal
Predict occupancy and departmental workload.

### Inputs
- booking pace
- lead time / booking characteristics
- historical occupancy
- weather or world signals where available
- synthetic resort operational history
- relevant derived features

### Outputs
- daily occupancy forecast
- expected arrival velocity
- labor-hour requirements
- confidence / fallback indicator

### ML Requirement
Use the already-trained joblib model where compatible.

The supplied implementation plan identifies:
- Ridge / Gradient-Boosting style forecasting
- `occupancy_forecast_model.joblib`
- `staff_demand_model.joblib`

### Important Integration Constraint

The source material notes compatibility issues for some serialized sklearn pipelines and identifies `scikit-learn==1.6.1` as the fastest compatibility fix. The team must pin that version for the FastAPI inference service or retrain affected pipelines against the environment actually used at the venue.

Affected artifacts called out in the source:
- `fnb_demand_model.joblib`
- `inventory_demand_model.joblib`
- `maintenance_randomforest_model.joblib`
- `occupancy_forecast_model.joblib`
- `staff_demand_model.joblib`
- `ticket_urgency_model.joblib`

### UX Requirement
Forecasts must display:
- date
- predicted occupancy
- expected labor demand
- forecast status
- fallback warning when applicable

---

## 9.5 Resort Time Machine — Forward Simulation

### Goal
Allow the manager to stress-test “what-if” scenarios before changing real operational state.

### Inputs
- occupancy
- weather
- inflation / cost pressure
- optional demand shock
- selected resource constraints

### Outputs
- GOPPAR
- housekeeping delay
- burnout risk
- service / wait time
- F&B pressure
- inventory effect
- overall resilience / stress indicator
- recommended actions

### Interaction
- touch-friendly sliders
- immediate visual response
- before/after comparison
- risk-state changes
- department impact breakdown

### Performance Target
Core deterministic simulation calculations should feel instant in the UI. The source plan targets sub-50ms computation excluding network overhead for the primary slider interaction.

### Non-Requirement
The simulator does not need to model every hotel process physically. It must produce internally consistent cross-department consequences using transparent deterministic relationships.

---

## 9.6 Safe Operating Envelope — Reverse Time Machine

### Goal

Answer:

> “What is the maximum occupancy this resort can safely handle with today’s resources?”

### Inputs
- active cleaners
- kitchen / pantry inventory
- shift-hour limits
- relevant operational constraints
- target service thresholds

### Outputs
- maximum safe occupancy
- bottleneck department
- resource gap
- unlock actions

### Example

**Input**
- active housekeepers: 6
- salmon stock: 15kg
- shift limit: 8 hours

**Output**
- safe ceiling: approximately 82%
- projected demand: 95%
- resource gap:
  - housekeeping hours
  - ingredient stock
- proposed action:
  - temporary staff transfer
  - replenishment PO
  - bounded pricing change

### Hero USP

This is a signature feature because it reverses the normal hotel decision:

**Normal:** “If occupancy becomes 95%, what happens?”  
**Smart Resort 360:** “Given today’s constraints, what occupancy can we safely accept?”

---

## 9.7 AI Decision Council

### Goal
Provide coordinated multi-department reasoning over one simulated state.

### Specialist Agents

1. **Revenue Agent**
   - occupancy
   - ADR
   - demand elasticity
   - pricing

2. **Operations Agent**
   - room turnover
   - housekeeping capacity
   - maintenance load

3. **F&B Agent**
   - food demand
   - pantry stock
   - kitchen capacity
   - supplier risk

4. **Guest Experience Agent**
   - complaints
   - requests
   - sentiment
   - service impact

5. **Workforce Agent**
   - staffing gaps
   - overtime
   - fatigue
   - temporary staffing

6. **Safety / Risk Agent**
   - weather
   - incident risk
   - operational constraints
   - safety boundaries

7. **Chief Decision Agent**
   - reconciles structured outputs
   - identifies trade-offs
   - produces one coordinated plan

### Agent Contract

Every decision plan must contain:

- situation
- evidence
- predicted impacts
- options
- trade-offs
- recommended action
- expected impact
- confidence
- required approval
- rollback plan

### Agent Safety Rule

Agents do not invent the numeric forecast.

The numerical layer is authoritative for:
- occupancy
- forecast
- staffing requirement
- inventory depletion
- simulation outputs
- risk metrics

Agents only reason over those values and explain how to act on them.

---

## 9.8 Prescriptive Action Cards

### Goal
Convert model outputs into a concrete operational decision.

### Action Card Contents
- action title
- affected departments
- trigger
- evidence
- current state
- proposed state
- predicted benefit
- predicted risk
- confidence
- approval level
- implementation steps
- rollback plan
- created timestamp
- model / agent version

### Possible Actions
- transfer cross-trained staff
- adjust room rate within pricing clamps
- adjust menu price on scarce ingredient
- draft replenishment PO
- create engineering task
- prioritize maintenance ticket
- issue guest apology / recovery credit
- raise an operational alert

---

## 9.9 Human-in-the-Loop Swipe Approval Queue

### Goal
Make approval fast, visible, and trustworthy.

### Interactions
- Swipe right = approve
- Swipe left = reject
- Modify = edit before approval

### Rules
- High-risk actions require explicit approval.
- Low-confidence actions require approval.
- Material pricing changes require approval.
- Employment-related actions require approval.
- Safety-related actions require approval.

### Audit Requirements
Every decision stores:
- action ID
- user / role
- decision
- timestamp
- original recommendation
- modifications
- model/version
- confidence
- resulting state change
- override reason, where applicable

---

## 9.10 Review Intelligence / Explainable ABSA

### Goal
Convert guest text into operational intelligence.

### Input
Unstructured guest review / feedback text.

### Output
- aspect
- polarity / sentiment
- confidence
- highlighted trigger words
- severity / urgency
- room / asset if detectable
- ticket recommendation
- ticket ID after routing

### Core Aspects
At minimum:
- Cleanliness
- Service
- F&B
- Comfort
- Maintenance-related issues

### Example
Input:
“AC in Room 304 is rattling and leaking.”

Output:
- aspect: Comfort / Maintenance
- polarity: negative
- confidence: high
- highlighted terms: rattling, leaking
- destination: Engineering
- ticket: created
- SLA: started

### Fallback
If Gemini is unavailable:
- local TF-IDF + Logistic Regression sentiment fallback
- deterministic regex/aspect mapping for obvious maintenance phrases

The source material identifies these local artifacts:
- `sentiment_tfidf_vectorizer.joblib`
- `sentiment_fallback_model.joblib`

---

## 9.11 Automated Task Routing & Facilities Kanban

### Goal
Make maintenance and service issues executable workflows.

### Kanban States
- To Do
- In Progress
- Blocked
- Completed

### Ticket Requirements
- ticket ID
- source
- room / asset
- category / aspect
- priority
- SLA clock
- assigned department
- status
- created time
- last updated
- resolution time
- evidence / original text
- duplicate reference if merged

### Automation
Review → parse → route → create ticket → start SLA → assign → resolve → log outcome.

---

## 9.12 Roster Intelligence

### Goal
Generate a conflict-free roster that responds to predicted demand.

### Inputs
- forecast labor demand
- staff availability
- skill matrix
- cross-training
- max shift duration
- overtime limits
- department minimum staffing

### Output
- shift assignments
- reallocation suggestions
- staffing gaps
- estimated labor cost
- overtime exposure

### Scheduling Method
For the MVP, use a deterministic greedy + constraint-backtracking scheduler as a transparent and fast proxy for a more sophisticated GASA approach.

### Cross-Training Example
If a Spa worker meets a cross-training coefficient threshold for Front Office, the engine may recommend a temporary Front Office allocation during a surge.

### Constraints
- do not exceed shift limits
- respect minimum department staffing
- avoid skill mismatch
- flag or block overtime cap violations
- preserve critical roles
- log emergency overrides

---

## 9.13 Plate-to-Pantry F&B Yield Loop

### Goal
Connect booking pace to ingredient consumption and purchasing.

### MVP Inventory
To stay 24-hour feasible, track a very small set of high-value ingredients:
- Fresh Salmon
- Avocado
- Butter
- Champagne
- Steak

Fallback MVP:
- Fresh Salmon only

### Logic
1. occupancy forecast increases expected covers
2. covers increase ingredient depletion
3. stock approaches safety threshold
4. system raises a low-stock alert
5. menu-price nudge is suggested within limits
6. replenishment PO is drafted
7. manager approves before any consequential action

### Important Safety Rule
Pricing should never be unconstrained. All menu and room rate changes must obey business-rule clamps.

---

## 9.14 Dynamic Pricing

### Goal
Balance revenue opportunity with operational capacity.

### Inputs
- demand
- occupancy
- room capacity
- rate
- elasticity assumptions
- operational safe ceiling
- current service risk

### Outputs
- suggested room rate
- suggested menu price
- reason
- expected revenue effect
- operational risk
- confidence
- approval requirement

### Principle
Pricing is not optimized in isolation. When operating capacity is constrained, the system should be able to recommend rate throttling or controlled rate increases rather than blindly maximizing occupancy.

### Safety
- min/max price limits
- maximum rate delta per decision
- mandatory human approval for material changes
- audit logging

---

## 9.15 Predictive Maintenance

### Goal
Detect asset anomalies before failure and combine them with guest feedback.

### Inputs
- equipment telemetry where available
- maintenance history
- anomaly scores
- recurring guest complaints

### MVP Approach
Use Isolation Forest for anomaly scoring on the AI4I-style maintenance dataset, with deterministic thresholds for demo behavior.

Source artifacts:
- `maintenance_isolationforest_model.joblib`
- optional comparison model: `maintenance_randomforest_model.joblib`

### Cross-Source Learning
A repeated complaint on the same room/asset plus an anomaly signal should increase the priority of a preventive-maintenance recommendation.

---

## 9.16 Guest Segmentation & Personalization

### Goal
Use guest behavior and preference signals to support personalized service hints.

### Segmentation Inputs
Where explicitly available:
- age bracket
- spending score
- stay length
- service-request behavior
- relevant booking behavior

### Model
KMeans segmentation with a scaler.

Source artifacts:
- `guest_segmentation_kmeans_model.joblib`
- `guest_segmentation_scaler.joblib`

### Output
A non-sensitive guest segment and operational personalization hint, such as:
- family-oriented activity interest
- premium dining propensity
- frequent service-request guest
- long-stay convenience preference

### Privacy Boundary
Do not infer sensitive characteristics from names, nationality, ethnicity, religion, or other indirect information.

---

## 9.17 World Pulse

### Goal
Inject external conditions into resort planning.

### MVP Signals
- weather
- optional event / demand shock signal

### Primary Weather Source in Build Plan
Open-Meteo is the preferred low-friction MVP source, with synthetic fallback.

### Future Integration
- local event feeds
- transport disruption
- inflation / supplier cost signals
- regional risk alerts

### UX
The World Pulse card must explain:
**signal → affected departments → expected impact**

---

## 9.18 Guest Risk / Service Recovery

### Goal
Prevent predictable guest dissatisfaction during operational stress.

### Example
If check-in wait is projected above a threshold:
- identify affected guest population
- recommend proactive service recovery
- surface guest-risk card

### MVP Service Recovery
Optional small fixed-value recovery such as a beverage credit.

### Rule
This remains a recommendation until approved when it has financial impact.

---

## 9.19 Resort Resilience / Stress Score

### Goal
Summarize the operational trade-off between profit opportunity and service risk.

### Inputs
- GOPPAR or revenue health
- occupancy pressure
- staffing stress
- housekeeping delay
- F&B wait
- inventory risk
- safety risk

### Output
A normalized 0–100 operational health / resilience indicator.

### Interpretation
- high score: capacity and service remain balanced
- medium score: growing operational stress
- low score: capacity constraints or service risk dominate

This is a decision-support indicator, not a standalone truth.

---

## 10. Functional Requirements Master List

### Command Center
- FR-001: Show current occupancy.
- FR-002: Show revenue/GOPPAR metric.
- FR-003: Show workforce stress.
- FR-004: Show guest service score.
- FR-005: Show active alerts.
- FR-006: Show highest-priority recommended action.

### Forecasting
- FR-007: Produce occupancy forecast.
- FR-008: Produce labor requirement forecast.
- FR-009: expose confidence/fallback status.
- FR-010: support seeded demo data.

### Simulation
- FR-011: allow occupancy what-if input.
- FR-012: allow weather scenario.
- FR-013: allow inflation / cost scenario.
- FR-014: calculate cross-department impacts.
- FR-015: show baseline vs simulated state.
- FR-016: compute or surface a resilience/stress metric.

### Safe Capacity
- FR-017: accept active resource constraints.
- FR-018: compute maximum safe occupancy.
- FR-019: identify bottleneck.
- FR-020: show resource gap.
- FR-021: propose capacity-unlocking actions.

### Decision Council
- FR-022: run specialist domain reasoning.
- FR-023: use one shared state snapshot.
- FR-024: generate chief recommendation.
- FR-025: expose confidence.
- FR-026: expose trade-offs and evidence.

### Approval
- FR-027: create action cards.
- FR-028: approve / reject / modify.
- FR-029: enforce approval for risky actions.
- FR-030: update operational state on approval.
- FR-031: write audit record.

### Reviews
- FR-032: ingest guest text.
- FR-033: parse aspect/sentiment.
- FR-034: highlight evidence words.
- FR-035: route to department.
- FR-036: create ticket.
- FR-037: detect duplicates.

### Kanban
- FR-038: show tickets.
- FR-039: change status.
- FR-040: record resolution time.
- FR-041: stop SLA timer on completion.

### Workforce
- FR-042: read predicted labor needs.
- FR-043: evaluate availability and skills.
- FR-044: generate roster.
- FR-045: suggest reallocation.
- FR-046: prevent hard constraint violations.

### Inventory
- FR-047: read stock.
- FR-048: project depletion.
- FR-049: trigger low-stock alert.
- FR-050: suggest replenishment.
- FR-051: produce menu-price recommendation.

### Maintenance
- FR-052: compute anomaly score.
- FR-053: surface anomaly alerts.
- FR-054: connect repeated complaints to assets.
- FR-055: suggest preventive maintenance.

### Guest Segmentation
- FR-056: compute or load guest segment.
- FR-057: show non-sensitive personalization hints.

### Notifications
- FR-058: surface new operational alerts.
- FR-059: notify affected staff after approved changes.
- FR-060: support polling fallback.

---

## 11. End-to-End Decision Contract

Every coordinated decision must conceptually follow this contract:

### Situation
What changed?

### Evidence
Which trusted signals support the interpretation?

### Predicted Impacts
What will happen across departments if no action is taken?

### Options
What are the feasible responses?

### Trade-offs
What does each option improve or worsen?

### Recommended Action
What should be executed if approved?

### Expected Impact
What are the predicted benefits and risks?

### Confidence
How confident is the system?

### Approval
Does this action require human approval?

### Rollback
How is the decision reversed?

This contract must remain stable across all agent outputs and action-card types.

---

## 12. Data Requirements

## 12.1 Core Collections / Entities

### Users
- id
- name
- role
- permissions
- status

### Rooms
- room id
- room type
- status
- occupancy
- cleaning status
- maintenance state

### Bookings
- booking id
- room / room type
- booking date
- arrival
- departure
- booking pace
- source / channel

### Staff Roster
- staff id
- department
- shift
- availability
- skills
- cross-training
- fatigue
- overtime
- status

### Pantry Inventory
- item id
- ingredient
- stock
- safety threshold
- unit
- expiry
- supplier
- expected delivery
- price

### Operational Tickets
- ticket id
- source
- room / asset
- aspect
- priority
- SLA
- assigned team
- status
- timestamps
- resolution

### Action Cards
- action id
- recommendation
- type
- affected domains
- confidence
- risk
- approval status
- model version
- created timestamp
- execution timestamp

### Audit Log
- event id
- actor
- role
- action
- before state
- after state
- timestamp
- model/version
- explanation
- override reason

### Guest Profile / Segment
- guest id
- non-sensitive preferences
- segment
- stay history summary

### Maintenance Assets
- asset id
- room / location
- equipment type
- history
- anomaly score

### World Signals
- signal id
- source
- type
- timestamp
- severity
- value
- affected departments

---

## 13. Data & ML Strategy

The source plan adopts a hybrid strategy because no single public dataset represents a complete resort’s operational state.

### 13.1 Real / Public Data Where Appropriate

- Hotel Booking Demand for occupancy / demand
- TripAdvisor / hotel review data for sentiment fallback and review intelligence
- AI4I 2020-style industrial data for maintenance anomaly modeling
- Mall Customer Segmentation for segmentation validation
- Food Demand Forecasting for F&B demand patterns
- synthetic operational logs where no public equivalent exists

### 13.2 Synthetic Data

Generate causally linked resort operations for:
- staff roster
- room state
- pantry inventory
- ticket history
- maintenance history
- guest profiles
- world-signal scenarios

The generator must preserve internal relationships. Example:
higher occupancy → more arrivals → more room turns → more housekeeping load → more F&B demand → faster ingredient depletion.

### 13.3 Already-Trained Model Artifacts

The project source says trained joblib files are already available. The build should reuse those artifacts where environment-compatible.

Expected capabilities include:
- occupancy forecast
- F&B demand
- inventory demand
- staff demand
- maintenance anomaly detection
- ticket urgency
- guest segmentation
- offline sentiment

### 13.4 Fallback Hierarchy

For every model:
1. trained model
2. deterministic or statistical fallback
3. static seeded demo value only as a last fallback

Every fallback response must be visibly marked.

### 13.5 Model Transparency

Each inference should expose:
- model name
- version
- input freshness
- confidence if available
- fallback status
- timestamp

---

## 14. API / Service Requirements

The PRD does not prescribe implementation code, but the product must expose stable service contracts equivalent to:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/dashboard` | Command Center metrics and alerts |
| GET | `/api/v1/forecast` | Occupancy and labor forecast |
| POST | `/api/v1/simulate` | Forward what-if scenario |
| POST | `/api/v1/safe-envelope` | Reverse capacity calculation |
| POST | `/api/v1/parse-review` | ABSA / review intelligence |
| POST | `/api/v1/decision-council` | Specialist agents + chief decision |
| POST | `/api/v1/generate-plan` | Generate action cards |
| POST | `/api/v1/approve-plan` | Approve / reject / modify action |
| POST | `/api/v1/schedule` | Generate or update roster |
| POST | `/api/v1/tasks` | Task creation / update |
| GET | `/api/v1/notifications` | Operational notifications |

The source build plan also defines event concepts such as:
- occupancy surge
- action-card approval
- maintenance-ticket creation

HTTP polling must remain the reliable fallback even if a push layer is added.

---

## 15. Non-Functional Requirements

### NFR-001 — Reliability
No critical screen should hard-crash because of:
- null values
- model failure
- API failure
- Gemini failure
- weather API failure
- malformed optional data

### NFR-002 — Responsiveness
Primary simulation interactions should feel real-time. Numerical calculations should target the source plan’s sub-50ms objective excluding network overhead.

### NFR-003 — Fault Tolerance
Fallback responses must preserve the expected schema.

### NFR-004 — Explainability
High-impact actions must show supporting evidence, confidence, trade-offs, and rollback.

### NFR-005 — Auditability
Every state-changing AI recommendation and approval must be traceable.

### NFR-006 — Security
- role-gated writes
- strict input validation
- CORS allow-list
- secret isolation
- sanitized rendering
- prompt-injection defenses
- least-privilege access

### NFR-007 — Privacy
Only collect necessary guest information explicitly provided for service delivery. Never expose one guest’s private information to another.

### NFR-008 — Maintainability
Frontend, gateway, and compute responsibilities should remain separated to keep the 24-hour system understandable and testable.

### NFR-009 — Demo Safety
A live demo must be able to complete the core flows even with internet loss or failed optional dependencies.

---

## 16. Security, Privacy & AI Governance

### 16.1 Role Authorization
Every state-changing operation must check role permissions.

### 16.2 Validation
All model and API inputs must be schema-validated.

Examples:
- occupancy constrained to a valid business range
- numeric fields bounded
- text input size limited
- enums used for statuses and decisions

### 16.3 Secrets
- API keys in environment variables
- no secrets in source control
- `.env` excluded from version control

### 16.4 Prompt Injection Defense
Guest review text is untrusted data.

Prompts must:
- use structured output
- treat review text as data, not instructions
- ignore embedded commands
- validate returned schema before use

### 16.5 Human Approval
Never auto-execute:
- safety actions
- employment-related changes
- large price changes
- other material high-impact decisions

### 16.6 Privacy
Do not infer:
- religion
- ethnicity
- nationality-based traits
- sensitive health characteristics
- sensitive identity traits

from names or indirect signals.

### 16.7 Audit
Every decision must include enough provenance to reconstruct:
**input → inference → recommendation → approval → action → outcome**

---

## 17. Edge Cases & Failure Handling

| Edge Case | Required Behavior |
|---|---|
| Missing / corrupted PMS data | Impute from recent comparable data and show a visible warning |
| Empty resort data / cold start | Use seeded defaults and request baseline configuration |
| Occupancy >98% | Clamp operations and trigger emergency-capacity warning |
| Staff sick / no-show | Re-run roster allocation using eligible cross-trained staff |
| Skill mismatch | Block unsafe assignment |
| Overtime cap breach | Flag or prevent assignment |
| Ingredient stockout | Trigger replenishment and alternative-action warning |
| Supplier unavailable | Surface supplier risk and alternate procurement path |
| Duplicate review | Merge into active ticket and increment complaint count |
| Guest checked out before ticket completion | Reclassify as maintenance/internal task and preserve history |
| DND room | Do not auto-dispatch service without permission |
| Allergy conflict | Never infer or guess dietary safety |
| FastAPI timeout | Use deterministic fallback |
| ML model load failure | Use labeled fallback |
| Gemini failure | Use local sentiment/aspect fallback |
| Weather API failure | Use last-known/synthetic weather |
| WebSocket failure | Use HTTP polling |
| Conflicting agent outputs | Chief agent reconciles with deterministic evidence priority |
| Low confidence | Route to approval queue |
| Manager rejects plan | Preserve baseline and require/record override reason |
| Unauthorized role | Return clean authorization error |
| Malformed / oversized payload | Reject safely |
| Prompt injection in review | Treat as text, not executable instruction |

---

## 18. Acceptance Criteria

The 24-hour product is “done” only when the following are demonstrably true.

### AC-01 — Occupancy Simulation
Moving occupancy from a normal state toward a surge state updates:
- revenue metric
- housekeeping delay
- burnout / staffing pressure
- F&B demand / wait
without a page reload.

### AC-02 — Safe Capacity
Given current staff and pantry constraints, the system produces:
- safe occupancy ceiling
- bottleneck
- resource gap
- one or more capacity-unlocking actions.

### AC-03 — Decision Council
Multiple specialist perspectives are generated from the same scenario and reconciled into one structured chief plan.

### AC-04 — Approval
A manager can approve a plan in the swipe queue and the system updates operational state and audit log.

### AC-05 — Review Intelligence
A review such as “AC in Room 304 is rattling and leaking” produces:
- negative / affected aspect signal
- highlighted evidence terms
- engineering ticket
- ticket identifier
- visible Kanban entry

### AC-06 — Roster Reallocation
A surge or sick-leave event causes the scheduler to generate a valid reallocation without violating hard staff constraints.

### AC-07 — Inventory Loop
A simulated demand surge can reduce ingredient stock, trigger a low-stock alert, and create a replenishment / price recommendation.

### AC-08 — Pricing Guardrails
No generated rate or menu price recommendation can exceed configured business bounds.

### AC-09 — Authorization
A role without permission cannot execute a manager-only state-changing operation.

### AC-10 — Failure Safety
Disabling Gemini, the weather API, or the model service still leaves the core user flow usable with a visible fallback state.

### AC-11 — Auditability
Every approved/rejected/modified action contains actor, time, confidence/model metadata, and a description of what changed.

### AC-12 — End-to-End Demo
The team can complete:
**World Pulse → Forecast → Digital Twin → Simulation → Safe Capacity → Decision Council → Approval → Roster/Rate/Task update → Review ticket → Outcome**

within a short live demo without manual database editing.

---

## 19. Validation / Test Suite

The team should automate or manually validate at least these ten scenarios.

| Test | Scenario | Expected |
|---|---|---|
| TC-01 | Occupancy surge simulation | Cross-department metrics update |
| TC-02 | Guest review submission | ABSA + ticket creation |
| TC-03 | Approve action | DB / state update + audit |
| TC-04 | FastAPI timeout | Fallback response |
| TC-05 | Staff call-in sick | Valid reallocation |
| TC-06 | Ingredient inflation / depletion | Price + stock warning |
| TC-07 | Duplicate review | Ticket merge |
| TC-08 | Unauthorized approval | Authorization failure |
| TC-09 | Kanban completion | Status + resolution timer update |
| TC-10 | Notification polling | New action / alert appears |

---

## 20. UI / UX Product Requirements

### 20.1 Visual Direction

**Theme:** Dark Luxury Slate  
**Tone:** premium, calm, operational, decision-oriented

### 20.2 Core Screens

1. Login / persona selector
2. Command Center
3. Resort Time Machine
4. Safe Operating Envelope
5. AI Action Plan
6. Swipe Approval Queue
7. Staff mobile PWA view
8. Notifications Center
9. Review Intelligence
10. Facilities Kanban
11. Roster Scheduler
12. Forecast Analytics

### 20.3 Interaction Rules

- one primary action per major card
- visible status
- visible confidence
- visible fallback indicator
- before/after state wherever simulation is used
- no hidden high-impact action
- no unexplained autonomous database update
- mobile-friendly approval queue
- loading skeletons for API-backed surfaces
- non-fatal warning badge on dependency failure

### 20.4 “Judge WOW” Moments

The UI should emphasize:
1. occupancy slider causing a visible multi-department ripple
2. reverse safe-capacity ceiling
3. specialist-agent reasoning collapsing into one plan
4. swipe-to-approve execution
5. review text turning into a ticket
6. a visible audit trail showing human control

---

## 21. Technical Product Constraints

### Preferred Stack

**Frontend**
- React 18
- Vite
- Tailwind CSS
- Tremor / Recharts
- Framer Motion
- Lucide icons

**API Gateway**
- Node.js 20
- Express

**Compute / AI**
- Python 3.12
- FastAPI
- Pydantic
- pandas
- NumPy
- scikit-learn
- joblib
- Google Gemini API / SDK

**Database**
- MongoDB Atlas

**External Signals**
- Open-Meteo for weather in the MVP

**Deployment**
- Vercel for frontend
- Render / Railway for services
- MongoDB Atlas

These stack choices come directly from the supplied implementation plan and are optimized for fast parallel work in a 24-hour hackathon.

---

## 22. Logical Product Architecture

The product is a three-part runtime:

### Client Layer
Responsible for:
- views
- interaction
- simulation controls
- action cards
- approval
- Kanban
- notifications

### Orchestration Layer
Responsible for:
- role gates
- request validation
- API routing
- audit events
- coordination between frontend, database, and compute core

### Compute / Intelligence Layer
Responsible for:
- ML inference
- simulation
- safe-capacity calculation
- scheduling
- sentiment / review parsing
- decision council
- deterministic fallbacks

### Shared State Layer
MongoDB Atlas stores the Digital Twin state and decision history.

### Core Rule
The frontend should never become the source of truth. Operational truth belongs in the shared data layer and compute logic.

---

## 23. Integration Strategy

### MVP
- synthetic resort operational state
- trained model artifacts
- Gemini for live review intelligence / decision reasoning
- Open-Meteo for weather
- MongoDB Atlas for persistent state
- HTTP polling for dependable refresh

### Pilot
- Mews read integration
- Cloudbeds / revenue data
- richer event feeds
- more real operational history
- controlled write-back

### Production
- real PMS/POS webhooks
- staff mobile orchestration
- smart-room IoT
- multi-property digital twins
- stronger identity/security controls

---

## 24. 24-Hour Implementation Plan

## Phase 0 — Minute 0–30

### Freeze product contracts
- freeze entities
- freeze API response shapes
- freeze role definitions
- freeze Action Card schema
- pin sklearn compatibility
- validate model artifacts

### Output
Everyone works against the same contract.

---

## Phase 1 — Hour 0–4

### Frontend
- base shell
- navigation
- Command Center
- theme system
- Time Machine skeleton

### Backend / DB
- service scaffolding
- MongoDB connection
- seed Digital Twin
- dashboard endpoint

### ML
- load models
- verify feature order
- verify serialized pipelines
- build compute service skeleton
- build fallback formulas

### Milestone
Base architecture and seeded dashboard operational.

---

## Phase 2 — Hour 4–8

### Frontend
- simulator sliders
- live gauges
- safe-capacity screen

### Compute
- simulation matrix
- safe operating envelope
- forecast endpoint

### Backend
- `/simulate`
- `/safe-envelope`
- persistence

### Milestone
Changing occupancy visibly changes cross-department metrics.

---

## Phase 3 — Hour 8–12

### Review Intelligence
- review input
- ABSA result
- highlighted evidence
- routing
- ticket creation

### Frontend
- Review Intelligence screen
- Kanban board

### Backend
- review parse endpoint
- ticket CRUD

### Milestone
A guest complaint becomes a real operational ticket.

---

## Phase 4 — Hour 12–16

### Decision Council
- specialist outputs
- chief plan

### Approval
- Action Cards
- swipe UI
- audit

### Roster
- deterministic scheduler
- cross-training
- reallocation

### Milestone
Approval changes the Digital Twin.

---

## Phase 5 — Hour 16–20

### Hardening
- role gate tests
- fallbacks
- invalid input
- duplicate review logic
- polling
- empty/null states

### Optional Tier-2
- pantry loop
- maintenance anomaly
- segmentation
- World Pulse

### Milestone
Full end-to-end dry run passes.

---

## Phase 6 — Hour 20–24

### Polish
- visual hierarchy
- transitions
- status colors
- labels
- error messages
- demo data reset

### Deployment
- public URL
- secrets check
- database seed check
- final regression

### Demo
- rehearse 3-minute narrative
- assign presenters
- define exact click order
- freeze scope

---

## 25. Demo Narrative

### 0:00–0:30 — The Problem

Open Command Center.

Show:
- occupancy surge
- service pressure
- cross-department risk

Message:
Existing hotel systems show isolated metrics. Smart Resort 360 shows the connected operational consequence.

### 0:30–1:15 — Predict + Simulate

Open Time Machine.

Move occupancy toward 95%.

Add storm scenario.

Show:
- housekeeping lag
- burnout
- F&B wait
- inventory risk
- resilience

### 1:15–2:00 — Decide

Open Safe Operating Envelope.

Show current safe capacity.

Open Decision Council.

Show:
- Revenue view
- Operations view
- F&B view
- Guest Experience view
- Workforce view
- Safety view
- Chief coordinated plan

### 2:00–2:30 — Approve + Act

Open Swipe Queue.

Show evidence.

Swipe right.

Demonstrate:
- roster change
- bounded rate update
- notification
- audit log

### 2:30–3:00 — Guest Signal → Work Order

Submit:
“AC in Room 304 is rattling and leaking.”

Show:
- highlighted words
- negative aspect
- engineering routing
- ticket creation
- Kanban
- learning / repeated-failure flag

### Closing Line

> “From a signal in the world to a measurable, human-approved action inside the resort.”

---

## 26. Winning Differentiation

The product must not pitch “AI dashboard” as its primary identity.

### Hero USP 1 — Reverse Time Machine

**Maximum Safe Capacity Engine**

Instead of asking only:
> “What happens at 95% occupancy?”

it answers:
> “How much occupancy can we safely accept with today’s staff and inventory?”

Then it explains what resources are needed to unlock additional capacity.

### Hero USP 2 — Plate-to-Pantry Yield Loop

Connect:
**booking pace → covers → ingredient demand → pantry risk → menu pricing / replenishment action**

This demonstrates that room demand and kitchen operations are one connected system.

### Signature Differentiator 3 — Closed-Loop Human Approval

**Signal → prediction → simulation → decision → approval → action → verification → learning**

The system does not stop at a recommendation.

### Signature Differentiator 4 — Explainable Action Cards

Guest feedback or operational signals show the evidence driving the recommendation.

### Signature Differentiator 5 — Cross-Department Reasoning

Six domain agents read the same simulated state and negotiate trade-offs through a chief decision layer.

### Signature Differentiator 6 — Resilience Awareness

The system does not optimize revenue while ignoring service risk.

---

## 27. Business Value Hypotheses

These are product hypotheses, not guaranteed deployment outcomes.

### General Manager
- fewer surprise operational bottlenecks
- faster cross-department decisions
- clearer accountability
- visibility into safe capacity

### Revenue Manager
- pricing decisions informed by operational constraints
- reduced risk of selling inventory the property cannot service well

### Housekeeping
- proactive workload awareness
- dynamic staffing support
- fewer last-minute changes

### F&B
- fewer avoidable stockouts
- better preparation for occupancy surges
- improved procurement timing

### Facilities
- earlier failure detection
- faster ticket routing
- repeated-issue visibility

### Guest Experience
- faster response to negative signals
- more consistent service recovery
- improved personalization

### Leadership
- a shared operational model rather than fragmented departmental views

---

## 28. Metrics & Success Criteria

### Product Metrics
- percentage of critical data domains represented in Digital Twin
- time from signal to recommendation
- action-card approval latency
- percentage of recommendations with evidence
- percentage of failure scenarios with successful fallback
- percentage of end-to-end demo flows completed without manual DB edits

### Operational Metrics to Show in the Demo
- occupancy
- housekeeping lag
- F&B wait
- staffing gap
- burnout risk
- inventory stock level
- projected GOPPAR
- service score
- resilience score

### ML / System Metrics
Use appropriate metrics for each task:
- forecasting error (MAE / RMSE)
- classifier precision/recall, not raw accuracy alone for imbalanced maintenance anomalies
- clustering validation where relevant
- simulation consistency / rule checks
- scheduler constraint-violation count

The source plan explicitly cautions against evaluating the imbalanced maintenance dataset with raw accuracy only.

---

## 29. Operational Safety Boundaries

### Never fully autonomous in MVP
- major room-rate changes
- employment / staffing changes with material consequence
- safety actions
- guest financial compensation above configured threshold
- irreversible database mutations

### Always show
- confidence
- source / evidence
- fallback status
- expected impact
- rollback path

### Manual Override
Human control must always remain available.

---

## 30. Failure-Safe UX

Every major screen must have:

### Loading
- skeleton
- progress indication where appropriate

### Success
- result
- source status
- timestamp

### Warning
- visible “fallback” or “data imputed” badge
- non-blocking explanation

### Error
- actionable recovery message
- no stack trace
- preserve current valid state

### Empty
- useful seed/demo state or setup guidance

---

## 31. Future Roadmap

### 1 Month — Pilot
- Mews reservation and housekeeping read stream
- richer Cloudbeds revenue inputs
- event signals
- improved real-data calibration

### 6 Months — Production
- mobile workforce orchestration
- real maintenance telemetry
- HVAC / room IoT
- advanced authentication
- production audit and compliance tooling

### 12 Months — Scale
- multi-property command center
- portfolio benchmarking
- self-healing workflows with bounded autonomy
- advanced staffing marketplace integration
- deeper PMS/POS write-back

---

## 32. Out-of-Scope for 24 Hours

Explicitly do not spend critical-path time on:

- full enterprise authentication
- native mobile app
- multi-property architecture
- direct PMS/POS production write-back
- full IoT integration
- full conversational AI concierge
- advanced LSTM retraining from scratch
- large-scale optimization solver migration
- complex event-stream infrastructure
- real vendor email delivery if not necessary for demo
- production compliance certification

These may be represented as roadmap stubs.

---

## 33. Product Risks & Mitigations

| Risk | Mitigation |
|---|---|
| ML serialization mismatch | Pin compatible sklearn or retrain affected models early |
| Gemini outage | Local sentiment fallback + deterministic rules |
| Weather API outage | Synthetic / last-known signal |
| API latency | Keep core simulation deterministic and local to compute service |
| Model confidence low | Route to human approval |
| Data quality poor | Validate and display freshness/fallback |
| Scope explosion | Protect Tier-1 decision loop |
| Agent inconsistency | Shared state + structured schema + evidence hierarchy |
| UI polish consumes build time | Functional core first, visual polish late |
| Live demo state corruption | seed/reset scenario |
| Internet loss | local fallbacks + polling |

---

## 34. Definition of Done

The Smart Resort 360 24-hour MVP is complete when:

1. The core Digital Twin is seeded and consistent.
2. A surge scenario is forecastable.
3. The Time Machine simulates cross-department impacts.
4. The Safe Operating Envelope returns a capacity ceiling.
5. Decision Council generates structured specialist reasoning.
6. Chief Decision Agent creates one Action Card.
7. Human approval changes the operational state.
8. Review intelligence creates a maintenance ticket.
9. Kanban reflects the ticket state.
10. Roster reallocation can react to workload.
11. At least one inventory signal affects the decision loop.
12. Fallbacks prevent blank screens.
13. Authorization protects state-changing routes.
14. Audit history records consequential decisions.
15. The complete demo works from a clean reset state.

---

## 35. Final Product Definition

Smart Resort 360 is:

> **A closed-loop resort decision-intelligence platform that maintains a Digital Twin of resort operations, predicts demand and operational stress, simulates future and safe-capacity scenarios, coordinates specialist AI reasoning, requires human approval for consequential actions, executes approved decisions across departments, and learns from measured outcomes.**

The product is intentionally built around a single memorable question:

> **“A storm, a booking surge, staffing pressure, and a pantry constraint hit at once — what should the resort do?”**

The answer should not be another chart.

The answer should be a **coordinated, explainable, human-approved action plan**.

---

## 36. Source-Basis Notes

This PRD is derived from the supplied Smart Resort 360 project material, including:

- PS ID 4 problem statement
- Master Implementation Plan
- 24-Hour Hackathon Technical Build Plan
- Market Gap, USP & Future Innovation Blueprint
- Dataset & ML strategy
- UI/UX and governance requirements
- edge-case / fail-safe strategy
- trained-model integration notes

The supplied source specifically defines the closed-loop SENSE → PREDICT → SIMULATE → DECIDE → APPROVE → ACT → VERIFY → LEARN model, the Digital Twin, AI Decision Council, Reverse Time Machine, Plate-to-Pantry loop, human approval controls, and the 24-hour MVP scope.

Where source materials describe benchmark values from academic papers or proposed hackathon outcomes, they should be presented in the product pitch as **reference evidence / targets / hypotheses**, not as guaranteed production results.

---

## 37. Quick Reference — MVP Checklist

### Core
- [ ] Role selector
- [ ] Command Center
- [ ] Digital Twin
- [ ] Forecast
- [ ] Time Machine
- [ ] Safe Operating Envelope
- [ ] Decision Council
- [ ] Chief Decision Agent
- [ ] Action Cards
- [ ] Swipe approval
- [ ] Audit trail

### Guest
- [ ] Review parser
- [ ] Aspect/sentiment
- [ ] evidence highlights
- [ ] maintenance routing
- [ ] Kanban

### Workforce
- [ ] labor demand
- [ ] skill matrix
- [ ] reallocation
- [ ] roster update

### F&B / Revenue
- [ ] pantry stock
- [ ] depletion
- [ ] low-stock warning
- [ ] bounded pricing recommendation

### Reliability
- [ ] model fallback
- [ ] Gemini fallback
- [ ] API fallback
- [ ] polling fallback
- [ ] null/error handling

### Governance
- [ ] role gates
- [ ] approval threshold
- [ ] audit
- [ ] rollback
- [ ] privacy boundary
- [ ] prompt-injection handling

### Demo
- [ ] clean seed/reset
- [ ] 3-minute flow
- [ ] public URL
- [ ] presenter roles
- [ ] fallback tested

see this prd if need improvement tell me make it very strong and perfect , give me copy paste version