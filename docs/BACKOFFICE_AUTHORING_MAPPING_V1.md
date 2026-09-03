# Backoffice authoring mapping v1

**Status:** technical design gate before editor implementation  
**Branch:** `backoffice`  
**Runtime baseline:** Gate D passed, Bosco StoryVersion v3

## 1. Decision

The v1 backoffice edits the three draft sources already stored on `story_versions`:

- `source_story` — structure, choices, cast-slot declarations and editorial metadata;
- `source_scenes` — backgrounds and deterministic visual slots by narrative step;
- `content_by_ref` — authored text fragments keyed by stable references.

Publishing validates these sources and freezes a self-contained `published_contract` with the existing shape:

```json
{
  "story": {},
  "scenes": {},
  "contentByRef": {},
  "catalog": {}
}
```

No `story_pages`, `story_choices` or `story_assets` tables are required for the first editor increment. “Page”, “Choice” and “Character role” are editorial projections over the JSON draft contract. A normalized relational model may be introduced later only if measured authoring or concurrency needs justify it.

## 2. Verified persistence mapping

| Editorial concept | Draft persistence | Published persistence | Runtime consumer |
| --- | --- | --- | --- |
| Project | `story_projects` | `story_projects.current_published_version_id` | `published-story` catalog |
| Version | `story_versions` | immutable `story_versions.published_contract` | `published-story` |
| Page / phase | `source_story.steps[]` | `published_contract.story.steps[]` | `resolveStoryPath()` |
| Initial page | `source_story.start` | `published_contract.story.start` | `resolveStoryPath()` |
| Linear connection | `step.next` | same | `resolveStoryPath()` |
| Branch choice | `step.decision` with `type: branch` | same | `resolveStoryPath()` |
| Text | `content_by_ref[ref]` + `step.content_ref` | `contentByRef` | `resolveStepText()` |
| Text variant | `step.variant_refs` | same | `resolveStepText()` |
| Scene | `source_scenes.scenes[step.key]` | `scenes.scenes[step.key]` | `resolveScene()` |
| Story cover | uploaded cover asset + `source_scenes.cover` | `published_contract.scenes.cover` + catalog image | story catalog and book cover |
| Visual role | `scene.slots[].role` | same | `resolveScene()` |
| Reader traversal | not part of draft | `book_stories.path_choices` + `story_version_id` | composer/render pipeline |
| Resolved book | not part of draft | `book_stories.content_snapshot` / render snapshot | delivery |

The current database already has the required version-level source fields. This mapping does not authorize a schema migration.

## 3. Editorial projection

The UI must never expose the raw structure as its primary interface.

### Page

A Page projects one `story.steps[]` entry:

| UI field | Contract field |
| --- | --- |
| Internal title | `step.title` |
| Editorial summary | `step.composer_summary` |
| Text editor | `contentByRef[step.content_ref]` |
| Following page | `step.next` |
| Choice | `step.decision` |
| Final page | `step.next == null` and no branch decision |
| Scene editor | `scenes.scenes[step.key]` |

Step keys and content references are generated and kept stable by the system. The author selects destinations by title; the UI stores their keys.

### Choice

A normal narrative choice maps to:

```json
{
  "type": "branch",
  "key": "d_sentiero",
  "prompt": "Da che parte prosegue [Nome]?",
  "options": [
    { "key": "felci", "label": "Tra le felci", "next": "s3_felci" },
    { "key": "ruscello", "label": "Lungo il ruscello", "next": "s3_ruscello" }
  ]
}
```

Day/night is not a special authoring mechanism in v1. If it changes story content, the author creates an ordinary branch choice whose options lead to the appropriate pages. `setup` and `variant_refs` remain supported for backward compatibility with Bosco but are not required by newly authored stories.

### Character role (cast slot)

The current runtime hard-codes `protagonist` and `helper`. New authoring requires named slots. The backward-compatible target contract adds a top-level declaration:

```json
{
  "cast_slots": [
    {
      "key": "protagonist",
      "label": "Protagonista",
      "allowed_sources": ["user_character"],
      "introduced_at": "start"
    },
    {
      "key": "playmate",
      "label": "Compagno di gioco",
      "allowed_sources": ["user_character", "catalog_character"],
      "introduced_at": "s3_playmate",
      "catalog_roster": ["etto", "briciola"]
    }
  ]
}
```

A cast decision assigns one slot when its page is traversed:

```json
{
  "type": "cast",
  "key": "choose_playmate",
  "slot": "playmate",
  "prompt": "Chi sta giocando con il protagonista?",
  "allowed_sources": ["user_character", "catalog_character"],
  "catalog_roster": [
    { "key": "etto", "entrance_ref": "entrances/playmate_etto.md" },
    { "key": "briciola", "entrance_ref": "entrances/playmate_briciola.md" }
  ],
  "user_character_entrance_ref": "entrances/playmate_personal.md"
}
```

Rules:

1. a slot is required only on traversed paths that reach its cast decision or a page that uses it;
2. a page cannot visually or textually use a slot before it has been assigned on every path reaching that page;
3. once assigned, a slot value is stable for the rest of that traversal;
4. untraversed branches do not create required assignments;
5. catalog rosters may be restricted per cast decision;
6. `helper` remains a valid slot key and maps to the existing Bosco behavior.

## 4. Reader choices target shape

The composer currently normalizes one hard-coded helper. The generalized, backward-compatible shape is:

```json
{
  "story": "new-story",
  "style": "papercut",
  "setup": {},
  "branches": {
    "d_sentiero": "felci"
  },
  "cast": {
    "protagonist": {
      "source": "user_character",
      "character_id": "character-uuid-1",
      "name": "Anna",
      "asset_ref": "immutable-asset-ref"
    },
    "playmate": {
      "source": "catalog_character",
      "character_id": "etto"
    }
  }
}
```

Compatibility adapter:

- legacy `choices.protagonist` becomes `cast.protagonist`;
- legacy `choices.cast.helper = "etto"` becomes a catalog assignment for slot `helper`;
- legacy `[Nome]` resolves from `protagonist`;
- legacy `[Aiutante]` and `[ENTRATA_AIUTANTE]` resolve from `helper`;
- existing `setup.atmosfera` and `[VARIANTE:atmosfera]` continue to work for Bosco.

## 5. Text markers

New stories use generalized, menu-inserted markers:

- `[PERSONAGGIO:protagonist]` — display name for a slot;
- `[PERSONAGGIO:playmate]` — display name for another slot;
- `[ENTRATA:playmate]` — entrance fragment selected by the cast decision;
- `[VARIANTE:key]` — retained only where a non-routing setup variable is deliberately used.

Legacy aliases remain accepted during the compatibility period:

- `[Nome]` → `[PERSONAGGIO:protagonist]`;
- `[Aiutante]` → `[PERSONAGGIO:helper]`;
- `[ENTRATA_AIUTANTE]` → `[ENTRATA:helper]`.

The editor inserts markers from declared slots. Authors do not type slot keys manually.

## 6. Scene mapping

### Story cover

The editor must provide a dedicated **Story cover** upload with an immediate
preview. Authors must not have to create a storage folder or copy a path by
hand. The upload produces a stable storage reference used by:

- the story card in Book Creator;
- the cover of a book that starts from that story;
- `source_scenes.cover` and the frozen published contract.

Publishing is blocked when the cover is missing. The temporary bear image is a
development fallback only and must never be treated as authored cover art.

Every reachable step must have exactly one scene definition in v1. A scene declares visual slots using the same narrative slot keys:

```json
{
  "scene_id": "s4_game",
  "background_ref": "scenes/s4_game.png",
  "slots": [
    { "role": "protagonist", "layout_slot": "left", "pose": "in_piedi" },
    { "role": "playmate", "layout_slot": "right", "pose": "in_piedi" }
  ]
}
```

For newly authored stories, the editor selects named layout slots supplied by the background/template instead of exposing `x`, `y`, `scale` and `z`. At publish time, a deterministic layout resolver compiles named slots to the normalized coordinates already consumed by `resolveScene()`.

Bosco keeps its existing coordinate-based `source_scenes` unchanged. The compiler must accept both:

- legacy resolved coordinates;
- new named layout slots that are resolved before publication.

## 7. Graph and path invariants

Publishing is blocked unless all invariants pass:

1. `start` identifies an existing step;
2. step keys, decision keys and option keys are unique in their scope;
3. every `next` identifies a step in the same version;
4. every reachable path terminates;
5. cycles are rejected in v1;
6. every non-draft step is reachable from `start`;
7. each branch decision has at least two options;
8. every reachable step has content and a scene;
9. every content, entrance and variant reference exists in `content_by_ref`;
10. every scene role is declared in `cast_slots` or is a recognized legacy role;
11. each slot is assigned before first use on every path reaching that use;
12. every catalog character referenced by a roster exists in the published catalog;
13. all markers resolve for every valid combination of path and cast assignments;
14. the resulting contract passes the canonical validator and composes without unresolved markers.

Path-sensitive slot validation is a data-flow check:

- entry state at `start` contains slots introduced at start;
- a cast decision adds its slot to the state on outgoing traversal;
- at a convergence, the definitely-assigned set is the intersection of incoming sets;
- a page may use only slots in its definitely-assigned set.

This prevents a converging page from using a character assigned in only one incoming branch.

## 8. Draft API boundary

The existing `authoring-admin` function is the intended privileged boundary, but its current shell behavior is not the final API.

Minimum future operations:

- list accessible projects and versions;
- create a project and initial draft;
- clone an existing version into a new draft;
- read a draft source bundle;
- save the complete draft source bundle with optimistic concurrency;
- validate a draft without publishing;
- preview a selected path and cast combination;
- publish only the exact validated revision.

Every save includes the last observed revision (`updated_at` initially; a dedicated integer revision may be added only if needed). A stale save returns a conflict and never overwrites silently.

Publishing must be atomic:

1. lock or compare the expected draft revision;
2. run validation;
3. build `published_contract` from that exact revision;
4. set the version to published and immutable;
5. update `story_projects.current_published_version_id`;
6. commit all state changes together or none.

## 9. Implementation slices

### Slice A — contract generalization, no UI

1. add fixtures for multiple named slots and a branch-conditional slot;
2. generalize choice normalization without changing legacy output;
3. generalize text and scene slot resolution;
4. add path-sensitive slot validation;
5. retain all Gate D and Bosco golden tests.

Exit criterion: legacy tests and new named-slot tests pass; live Gate D still passes.

### Slice B — draft API

1. project ownership/authentication;
2. create/read/save draft bundle;
3. optimistic concurrency;
4. validation and preview endpoints;
5. atomic publish operation.

Exit criterion: an authenticated author can create and publish a fixture contract through the API without direct database access.

### Slice C — no-code editor

1. project/version shell;
2. metadata;
3. page list and connections;
4. choices and path map;
5. text and slot markers;
6. cast slots;
7. scenes and named layout slots;
8. validation, preview and publish.

Exit criterion: a new linear story and a branched story with a path-conditional mixed-source cast slot are published without editing JSON or code.

## 10. Non-regression gates

Every implementation slice must verify:

- `npm test`;
- existing composer golden output;
- Gate D live runtime test;
- Bosco v3 remains current until an explicit publication replaces it;
- existing `book_stories.story_version_id` and snapshots remain unchanged;
- no migration or API exposes drafts to anonymous users.

## 11. Technical conclusion

The editor can be built over the existing StoryVersion source bundle. The next code increment is not a database redesign or a screen: it is **Slice A**, the backward-compatible generalization of the pure composer and validator from the fixed `protagonist/helper` model to named, path-aware cast slots.
