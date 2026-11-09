# GW Knowledge Base

A bilingual (English/French) knowledge base for Guild Wars 1 PvE speedclear builds. The model is build-agnostic; the Vow of Strength Dervish is the first build documented.

## Language

**Zone**:
An elite area cleared as a run (Fissure of Woe, Shards of Orr, the Underworld).
_Avoid_: area, dungeon, map

**VoS**:
Vow of Strength, the Dervish elite skill the first documented build is centered on.

**Build core**:
The skills, attributes and Loadout shared by every Build of one build family (e.g. the VoS core). It fixes the primary profession and between one and eight skills; any slot it leaves open is filled by each Build. A core with all eight skills fixed is itself a complete, playable bar. It may fix the secondary profession or leave it open.
_Avoid_: base build, main build

**Build**:
A concrete skill bar plus attributes and Loadout, run by one or more Roles (in any Zone), derived from one Build core: it swaps some of the core's skills, fills the core's open slots, may add a secondary profession the core leaves open, and overrides parts of the core's Loadout. A slot may list alternative skills the player can take instead.
_Avoid_: bar, template (a template is the build's import code)

**Role**:
A slot in a Zone's team composition, e.g. FoW SC's v1, v2, v3, v4. A Role keeps its identity across Party setups; what changes between setups is which Duties it carries.
_Avoid_: position, slot

**Duty**:
One concrete task performed during a run (ToC, camp, griffs, 360, top…), used as a reusable label on Builds and Gear. Each Duty belongs to exactly one Zone and has a place in that Zone's run order. The same Duty can belong to different Roles depending on the Party setup. Its label is the community's English shorthand, used as-is in both languages.
_Avoid_: job, task

**Party setup**:
A team size/strategy variant for a Zone (4-man, 5-man, beachway…). Lists which Roles take part and which Duties each one carries. Each Zone has one default Party setup.
_Avoid_: comp, team size

**Gear**:
Equipment worn or wielded: a weapon (base type plus mods), a weapon set, a rune or an insignia. Armor pieces are not Gear on their own; they appear only as slots of a Loadout.
_Avoid_: equipment, items (too broad — includes Consumables)

**Loadout**:
The Gear a Build core or Build actually wears: its weapon sets, and per armor slot the insignia, rune and (for the headpiece) attribute. It says what is worn, not how necessary it is; that is a Requirement.
_Avoid_: equipment, setup (a setup is a Party setup)

**Skill**:
A skill as the game defines it, with its official name and description in each language. Authors never write or translate skill text; commentary about a skill belongs to the Build that uses it. A Skill may have a community nickname (IAU, stab, battle stand), shared across both languages.

**Consumable**:
A single-use item used during a run. Kinds: cons (Essence, Grail, Armor), summoning stones, powerstones, sweets/alcohol, and other.
_Avoid_: cons (one kind of Consumable), pcons

**Requirement**:
A rule saying how necessary a Gear or Consumable is in a given context: level required, recommended, or optional, attached to a Zone, a Role, or a Duty, optionally with a short reason.
_Avoid_: prerequisite, must-have

## Relationships

- A **Zone** has one or more **Roles**, an ordered list of **Duties**, and one or more **Party setups**, one of which is the default
- A **Party setup** assigns **Duties** to the **Roles** taking part
- A **Role** runs exactly one **Build** and carries a set of **Duties**; several **Roles** may run the same **Build**
- Which **Duties** a **Role** carries depends on the **Party setup**
- A **Duty** may appear under different **Roles** across **Party setups**
- A **Build** derives from exactly one **Build core** and swaps some of its slots
- A **Build core** and each **Build** have a **Loadout**; a **Requirement** says how necessary Gear is in context, on top of any Loadout
- A **Gear** or **Consumable** carries zero or more **Requirements**; each targets one **Zone**, **Role**, or **Duty**

## Example dialogue

> **Dev:** "Is griffs part of v2?"
> **Player:** "Depends on the **Party setup** — the **Duty** moves between **Roles** when the team size changes."
