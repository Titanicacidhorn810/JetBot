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
];
