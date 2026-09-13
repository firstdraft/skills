---
name: "extend-app-ui"
description: "Build or extend an existing application's UI while preserving its chosen design, reusable components, and working behavior. Use for scaffold makeovers, new screens, interactive controls, or shared theme changes."
license: "MIT"
---

# Extend an application UI

Start from the user's design target and the application's source. Follow a supplied design or an explicit
redesign. An ordinary feature should look like it belongs to the same application.

## Find the existing design and components

Read project guidance and `UI.md` when present, then the theme entrypoint, relevant component examples, and one
comparable screen. The application owns its design and component contracts; this Skill supplies a workflow,
not a second design system. If guidance and implementation disagree, identify the difference before extending it.

Find where color, typography, spacing, density, and variants are controlled. Reuse an existing component or
composition before adding markup. Check installed versions and actual source before relying on a library API.
Sharing theme tokens alone does not make independently invented components consistent.

For Rails, read [Rails integration](references/rails.md). When an existing shadcn integration needs component
discovery, read [upstream tooling](references/shadcn.md). Neither reference is needed for unrelated stacks.

## Implement the requested change

Use semantic theme tokens and the app's maintained components. Establish hierarchy through weight, color,
grouping, and a small spacing/type scale. Upstream primitives and layout code may need literal values or Tailwind
arbitrary syntax; do not ban those mechanically or scatter replacement palette values across feature views.

When several screens need a new pattern, extend the smallest existing shared component that fits. Keep genuinely
different patterns distinct. Avoid building a general component framework for one screen. Record a new reusable
pattern in the app's existing example or `UI.md` so the next task can find it.

Preserve values, validation, authorization, navigation, and submission semantics. Include affected empty, invalid,
disabled, pending, and long-content states. Adapt navigation and content to a narrow viewport. For a theme change,
edit the shared authority and inspect both ordinary HTML and enhanced controls in every supported appearance mode.

## Verify the result

Start with the checks that exercise the changed surface. Once they pass, expand only for a new failure or
unresolved concern; report unrelated baseline failures instead of broadening the task.

Run relevant project checks and inspect the changed UI in a real browser. Exercise the actual form or navigation
path, open affected overlays, and compare with a related screen. For a comparative change, capture the relevant
state before editing and use the same content and viewports afterward.

Inspect the screenshots you capture. Check applicable themes, narrow layout, hierarchy, alignment, density, and
component treatments. Use browser measurements for precise claims; source classes alone do not establish the
rendered result. Recheck affected behavior after a visual correction. The `review-ui-consistency` Skill can support
a requested broader review when installed; completing a UI task does not require a separate model review.

Report what changed, what was reused, and the checks actually performed. Name material untested behavior. If no
browser is available, report source/test evidence and leave rendered appearance and interaction unverified.
