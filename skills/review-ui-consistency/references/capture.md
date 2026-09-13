# Capture guidance

Choose states based on the requested change and how it can fail:

| Dimension | Useful evidence |
|---|---|
| Environment | Applicable theme, viewport, loaded assets, actual CSP |
| Interaction | Open menu/dialog, focus, validation error, expanded content |
| Time | Before, during, and after a pending update or dismissal |
| Sequence | Repeated action, navigation away and Back, replacement/removal during interaction |
| Related surface | Same component role or variant on another relevant screen |

For each accepted capture, record the route or supplied artifact ID, viewport, theme, state, and how it was reached.
If timing matters, record the observed point in the sequence. Do not label a local approximation as production
evidence or a desktop browser as a native-client test.

Check that the intended element is visible and has a nonzero box before measuring it. Distinguish the element's
box from its text's glyph position. Hidden duplicates invalidate measurements. Name transformations such as
cropping or downscaling. Cite supplied measurement keys; for new measurements, record stable element identifiers
and property names beside the screenshot. Do not infer exact CSS values from pixels.

Reach transient states through observable readiness signals or controlled fixtures. A loading state is valid
evidence when it is the requested subject; an accidentally unfinished capture is not the completed screen. Use a
short sequence or video when a still image loses the failure. Inspect saved artifacts before using them.

For repeated reviews, follow existing app decisions and keep findings traceable to the current captures. Previous
screenshots or rejected findings are context, not fresh proof. Automated accessibility checks complement keyboard
and assistive-technology testing; their passing result does not establish complete accessibility.

Reference: [accessibility test limits](https://playwright.dev/docs/accessibility-testing).
