import type { Skill } from './types';

export const builtinSkills: Skill[] = [
  {
    name: 'debug',
    description: 'Systematic debugging — find root cause before fixing',
    trigger: 'bugs, errors, test failures, unexpected behavior',
    instructions: `# Systematic Debugging Mode

## Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

### Phase 1: Investigate
1. **Read errors carefully** — stack traces, line numbers, error codes
2. **Reproduce** — confirm the exact symptoms
3. **Hypothesize** — list 3+ possible causes, most likely first
4. **Test each hypothesis** — use tools to verify/eliminate

### Phase 2: Fix
5. **Apply minimal fix** — change only what's needed for the root cause
6. **Verify** — confirm the fix resolves the issue without side effects

### Rules
- Never guess fixes. Gather evidence first.
- If "just one quick fix" seems obvious — be MORE suspicious, not less.
- A fix that works but you can't explain WHY is not a fix.
- Log your reasoning: "I suspect X because Y. Testing by Z."`,
  },
  {
    name: 'code-review',
    description: 'Review code for quality, security, and improvements',
    trigger: 'review, audit, check code quality',
    instructions: `# Code Review Mode

For each piece of code, systematically check:

### 1. Correctness
- Logic errors, off-by-one, null/undefined handling
- Edge cases: empty input, large input, concurrent access

### 2. Security (OWASP Top 10)
- Injection (SQL, XSS, command)
- Auth/authz issues
- Sensitive data exposure
- CSRF, SSRF

### 3. Performance
- Unnecessary loops, O(n²) where O(n) works
- Memory leaks, unbounded growth
- Missing indexes, N+1 queries

### 4. Maintainability
- Naming clarity, single responsibility
- Dead code, unnecessary complexity
- Missing error handling on boundaries

### Output Format
Rate each area: ✅ Good / ⚠️ Needs Work / ❌ Critical
Provide specific line references and corrected code.`,
  },
  {
    name: 'architect',
    description: 'Design systems and plan implementations',
    trigger: 'design, plan, architecture, how to build',
    instructions: `# Architecture & Planning Mode

### Design Process
1. **Clarify requirements** — ask what's unclear before designing
2. **Propose 2-3 approaches** — with trade-offs for each
3. **Recommend one** — explain why, considering:
   - Simplicity (prefer less complexity)
   - Existing patterns in the codebase
   - Future extensibility vs YAGNI
4. **Break into steps** — each step 2-5 minutes, independently testable

### Design Checklist
- [ ] Data flow is clear (input → processing → output)
- [ ] Error cases are handled at boundaries
- [ ] No OWASP Top 10 vulnerabilities introduced
- [ ] Rollback strategy exists
- [ ] Changes are backward compatible (or migration planned)

### Output Format
\`\`\`
## Approach: [Name]
**Pros:** ...
**Cons:** ...
**Files to change:** ...
**Steps:**
1. ...
2. ...
\`\`\``,
  },
  {
    name: 'explain',
    description: 'Explain code, concepts, or architecture clearly',
    trigger: 'explain, how does this work, what does this do',
    instructions: `# Explain Mode

### Explanation Structure
1. **One-sentence summary** — what it does, in plain language
2. **Architecture overview** — high-level flow diagram (ASCII or description)
3. **Key code walkthrough** — annotate important sections
4. **Design decisions** — why was it built this way? Trade-offs?
5. **Gotchas** — edge cases, common mistakes, non-obvious behavior

### Principles
- Match complexity to the user's level — don't over-explain basics
- Use analogies when helpful
- Code speaks louder than prose — show, don't tell
- If you don't know, say so — don't fabricate explanations`,
  },
  {
    name: 'tdd',
    description: 'Test-Driven Development: Red → Green → Refactor',
    trigger: 'write tests, test-driven, TDD',
    instructions: `# Test-Driven Development Mode

### The Cycle (repeat for each behavior)

**🔴 RED — Write a failing test first**
- Test describes the BEHAVIOR, not the implementation
- Run it. It MUST fail. If it passes, the test is wrong.

**🟢 GREEN — Write minimum code to pass**
- Only enough code to make the test pass
- No extra features, no premature optimization
- Ugly code is fine at this stage

**🔵 REFACTOR — Clean up, tests still pass**
- Remove duplication
- Improve naming
- Extract helpers if needed
- Run tests again — they must still pass

### Rules
- Never write production code without a failing test
- One behavior per test
- Test names describe what the system DOES, not how
- If you can't write a test for it, the design needs to change`,
  },
  {
    name: 'writing',
    description: 'Write documentation, READMEs, and technical content',
    trigger: 'write docs, documentation, README',
    instructions: `# Technical Writing Mode

### Principles
1. **Lead with what the reader needs** — don't bury the lede
2. **One idea per paragraph** — if a paragraph covers two ideas, split it
3. **Use concrete examples** — abstract descriptions + example > abstract alone
4. **Active voice** — "the function returns X" not "X is returned by the function"
5. **Cut ruthlessly** — every word must earn its place

### Structure for Documentation
- **Title**: What is this? (1 line)
- **Quick Start**: Get running in < 2 minutes
- **Core Concepts**: 3-5 key ideas to understand
- **API Reference**: Exhaustive but scannable
- **Examples**: Real-world usage patterns
- **Troubleshooting**: Common issues and fixes

### Structure for Technical Specs
- **Problem**: What are we solving? Why now?
- **Proposal**: How will we solve it?
- **Alternatives considered**: What else could we do?
- **Risks**: What could go wrong?`,
  },
  {
    name: 'refactor',
    description: 'Improve code structure without changing behavior',
    trigger: 'refactor, clean up, simplify',
    instructions: `# Refactoring Mode

### Golden Rule: Behavior must not change

### Process
1. **Ensure tests exist** — if not, write characterization tests first
2. **Identify the smell** — what exactly is wrong?
3. **Apply one refactoring at a time** — small, reversible steps
4. **Run tests after each step** — catch regressions immediately

### Common Refactorings
- **Extract function**: 3+ lines doing one thing → named function
- **Inline**: Single-use abstraction → just put the code there
- **Rename**: Unclear name → name that describes intent
- **Move**: Code in wrong module → move to where it belongs
- **Simplify conditional**: Nested if/else → early returns or pattern match

### Don'ts
- Don't refactor and add features at the same time
- Don't refactor code you don't understand yet
- Don't create abstractions for one use case
- Don't rename things just for style — rename for clarity`,
  },
  {
    name: 'visualize',
    description: 'Create data visualizations and HTML dashboards',
    trigger: 'chart, graph, visualize, dashboard, plot',
    instructions: `# Visualization Mode

### Process
1. **Understand the data** — what are we visualizing? What story to tell?
2. **Choose chart type**:
   - Comparison → Bar chart
   - Trend over time → Line chart
   - Proportion → Pie/donut chart
   - Distribution → Histogram
   - Relationship → Scatter plot
   - Hierarchy → Treemap
3. **Build with render_html** — create a complete HTML page with embedded JS
4. **Polish** — titles, labels, colors, responsive layout

### Technical Approach
- Use pure HTML/CSS/JS (no external CDN dependencies)
- Canvas API or SVG for charts
- Responsive design with CSS Grid/Flexbox
- Dark-mode friendly color palettes
- Include data table alongside visualization for accessibility

### Best Practices
- Always label axes and include units
- Start Y-axis at 0 unless there's a good reason not to
- Use color meaningfully, not decoratively
- Keep it simple — one clear message per chart`,
  },
  {
    name: 'decision',
    description: 'Structured decision analysis using AHP (Analytic Hierarchy Process)',
    trigger: 'decide, choose, compare, select, trade-off, which one, pros cons, evaluate alternatives',
    instructions: `# Decision Analysis Mode (Doc2AHP)

Structured multi-criteria decision analysis using the Analytic Hierarchy Process.
Turn vague "which should I pick?" into quantified, defensible recommendations.

## When to Use
- 3+ alternatives with multi-dimensional trade-offs
- Architecture, tech stack, library, or tool selection
- Decisions requiring team justification or audit trail

## When NOT to Use
- Only 2 options → simple pros/cons
- Single dimension (e.g. pure cost) → compare directly
- Urgent → trust intuition, validate later

---

## Step 0: Input Mode Selection

Ask the user which mode:

**Mode A — Document-Grounded** (recommended for high-stakes):
- Extract criteria from user-provided docs, URLs, or web search
- Every criterion tagged with source: \`[Source: doc, section]\`
- Full traceability for team buy-in and compliance

**Mode B — Quick Analysis** (for rapid exploration):
- Generate criteria from domain knowledge
- Marked as "Source: domain knowledge"
- Faster but less traceable

---

## Step 1: Decision Framework Construction

1. **Define goal** in one sentence
2. **List alternatives** (3-7, pre-screen if more)
3. **Build hierarchy**: Goal → Criteria (≤7) → Sub-criteria (≤7 each)
4. **Cognitive constraints** (Miller's Law):
   - ≤ 7 criteria per level
   - ≤ 3 hierarchy depth
   - Each criterion must be independent, measurable, relevant

Example hierarchy:
\`\`\`
Select Best Framework
├── Technical Fit (features, performance, ecosystem)
├── Team Factors (learning curve, skills, hiring)
├── Engineering Quality (maintainability, testing, docs)
└── Business Factors (license, cost, vendor lock-in)
\`\`\`

Present hierarchy and **confirm with user** before proceeding.

---

## Step 2: Multi-Perspective Evaluation

Evaluate from 3-5 perspectives:

| Perspective | Focus |
|------------|-------|
| Technical Expert | Performance, architecture, tech debt |
| Business Analyst | ROI, market fit, business value |
| Ops Engineer | Deployment, monitoring, fault recovery |
| End User | Experience, feature completeness |
| Team Lead | Learning cost, productivity, hiring |

For each perspective, create pairwise comparison matrix using **Saaty 1-9 scale**:
- 1 = Equal importance
- 3 = Slightly more important
- 5 = Clearly more important
- 7 = Strongly more important
- 9 = Extremely more important

Show each matrix explicitly.

---

## Step 3: Consensus Aggregation

1. **Geometric mean** across perspectives for each pair:
   \`consensus_ij = (a_ij_p1 × a_ij_p2 × ... × a_ij_pK)^(1/K)\`
2. Apply user priority constraints (e.g. "performance first" → boost related criteria 1-2 levels)
3. Compute normalized weights per criterion
4. Present weight distribution as table + bar chart description

---

## Step 4: Consistency Check

1. **Transitivity**: If A > B and B > C, then A must > C
2. Flag contradictions, propose corrections
3. Recompute weights after fixes
4. Brief note on confidence level

---

## Step 5: Alternative Scoring

1. Score each alternative per sub-criterion (1-10 scale)
2. Compute weighted sum: \`Score = Σ(weight_i × score_i)\`
3. **Sensitivity analysis**: adjust top-2 weights by ±20%, check if ranking changes
4. Present as ranked table

---

## Step 6: Decision Report

Output structured report:

\`\`\`markdown
# Decision: [Goal]

## Recommendation
**[Winner]** — Score: X.XX / 10

## Ranking
| Rank | Alternative | Score | Key Strength |
|------|------------|-------|-------------|
| 1    | ...        | ...   | ...         |

## Weight Distribution
[Criteria weights table]

## Key Trade-offs
- Alt A leads in X but trails in Y
- Sensitivity: if Z weight +20%, ranking changes to...

## Risks & Mitigations
[Top risks of recommended option]

## Next Steps
[Actionable items]
\`\`\`

---

## Rules
- Always show your math — transparency builds trust
- Confirm hierarchy with user before computing
- Acknowledge uncertainty explicitly
- If user overrides a weight, respect it and note the adjustment
- For simple decisions (≤3 criteria, ≤3 alternatives), compress Steps 2-4 into one pass`,
  },
  {
    name: 'security',
    description: 'Security audit — OWASP Top 10, threat modeling, hardening',
    trigger: 'security, vulnerability, audit, hardening, OWASP, threat',
    instructions: `# Security Audit Mode

## Scope First
Ask: What are we securing? (API endpoint, full app, specific module, deployment config)

## Systematic Check (OWASP Top 10 + extras)

### 1. Injection (SQLi, XSS, Command)
- User input flows → trace from entry to output
- Check: parameterized queries, output encoding, command escaping
- Template literals with user data? \`dangerouslySetInnerHTML\`?

### 2. Broken Authentication
- Session management, token storage, password handling
- JWT validation, expiry, refresh flow
- Rate limiting on auth endpoints

### 3. Sensitive Data Exposure
- Secrets in code, logs, or git history
- HTTPS enforcement, CORS policy
- API keys in frontend code?

### 4. Broken Access Control
- Authorization checks on every endpoint
- IDOR (Insecure Direct Object References)
- Privilege escalation paths

### 5. Security Misconfiguration
- Default credentials, debug mode in production
- Unnecessary ports/services exposed
- Missing security headers (CSP, HSTS, X-Frame-Options)

### 6. Dependency Vulnerabilities
- Known CVEs in dependencies
- Outdated packages with security patches
- Lock file integrity

### 7. Additional Checks
- Path traversal (\`../\` in file operations)
- SSRF (Server-Side Request Forgery)
- Regex DoS (ReDoS)
- Race conditions in concurrent operations

## Output Format
For each finding:
\`\`\`
**[SEVERITY]** Title
- Location: file:line
- Risk: what could happen
- Fix: specific code change
- Verify: how to confirm the fix works
\`\`\`

Severity: CRITICAL / HIGH / MEDIUM / LOW / INFO`,
  },
  {
    name: 'perf',
    description: 'Performance analysis — find bottlenecks, optimize hot paths',
    trigger: 'slow, performance, optimize, bottleneck, latency, memory',
    instructions: `# Performance Analysis Mode

## Step 1: Measure Before Optimizing
- Never optimize without evidence of a bottleneck
- Ask: What is slow? How slow? What is the target?
- Identify the hot path (the 20% of code causing 80% of time)

## Step 2: Classify the Bottleneck

| Type | Symptoms | Tools |
|------|----------|-------|
| CPU-bound | High CPU, slow computation | Profiler, flame graphs |
| I/O-bound | Waiting on network/disk | Async tracing, waterfall |
| Memory | High RSS, GC pauses, OOM | Heap snapshots |
| Render | Janky UI, dropped frames | Performance timeline |
| Algorithm | O(n²) where O(n) works | Code inspection |

## Step 3: Common Fixes by Category

### Algorithm & Data Structure
- O(n²) → O(n log n) or O(n) with better data structure
- Repeated lookups → Map/Set instead of array scan
- String concatenation in loop → array push + join

### I/O & Network
- Sequential requests → Promise.all() for independent calls
- Missing caching → add memoization or HTTP cache
- Large payloads → pagination, compression, selective fields

### Rendering (Frontend)
- Excessive re-renders → React.memo, useMemo, useCallback
- Layout thrashing → batch DOM reads/writes
- Large lists → virtualization (windowing)
- Heavy computation → Web Worker

### Memory
- Unbounded caches → LRU with max size
- Event listener leaks → cleanup in useEffect/destroy
- Large object retention → WeakRef/WeakMap

## Rules
- One optimization at a time — measure after each
- Readability > micro-optimization unless proven bottleneck
- Document WHY the optimization exists (future maintainers)
- If < 2x improvement, consider if complexity is worth it`,
  },
];
