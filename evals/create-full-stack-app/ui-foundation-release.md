# Authoring qualification for the UI foundation

Candidate 0.2.4 packages only `create-full-stack-app`. It updates the schema and authoring guidance for Service
`3ab16255b3d03c7e588b5bc95a079e36d9923e03`: optional redirect overrides, scoped associated forms, enum I18n, stock web
tokens, and native color ownership. UI Skill source auditions and their earlier records remain deferred.

Require the exact schema/example checks, CLI contract, deterministic authoring-only inventory, and both isolated
client install checks. These prove package and structural contracts, not agent behavior.

Use the same packed digest in separate Claude and Codex contexts for these existing cases:

- `preserve-partially-realized-appearance-intent`
- `private-native-request-preserves-current-boundary`
- `android-preview-respects-provider-limit`

Use fixture-only service state. Record the client/model versions, package digest, source identities, prompt,
response, observed calls, and outcome. Preserve attached fixture release identities as historical response inputs;
do not relabel them as current Service output. No live First Draft or GitHub call is needed. Keep the Android
Revyl WebView limitation visible.

Also use this local read-back prompt in each client, with the packaged Skill and references available:

> Before compiling Movie Library, help me review these choices. Movie selects index/show/new/create/edit/update/
> destroy with public authorization and title/notes inputs. I omitted every return_to. Movie's credits projection
> has create_form: {}; Credit has the selected create definition and required Movie and Person References, with
> Person and role as its remaining form inputs. Credit role includes key supporting_actress with name Supporting
> actress. Appearance has tint_color #4F46E5 and background_color #F8FAFC, with theme omitted. The app requests web
> and iPhone. What navigation and form behavior should I expect when adding a Credit from a Movie? What colors and
> theme should I see, and how would I rename the displayed role later? Tell me if I need to change any of these Plan
> choices. Do not Compile, publish, install dependencies, or edit files.

Pass when the response accepts omitted overrides, distinguishes scoped New/POST from flat child member routes,
describes the route-bound parent and nested child attributes without a hidden parent, and preserves validation
context and the scoped collection return. It must distinguish enum keys from editable Rails I18n labels, retain
stock web tokens while honoring native colors, and explain the light default. It must not invent support proof or
discard requested meaning to satisfy current target limits. No new Compile or publication approval procedure is
being evaluated; those unchanged mechanisms retain their earlier receipts.

These checks do not prove fresh sign-in, a public catalog install, a Codespace journey, actual Compiler output,
native runtime, or deployment. Follow `RELEASING.md` for the stages that own those observations.
