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
A slot in a Zone's team composition, e.g. FoW's T1, MT, v1, UA. A Role keeps its identity across Strategies; what changes between Strategies is which Build it runs and which Duties it carries.
_Avoid_: position, slot

**Duty**:
One concrete task performed during a run (ToC, camp, griffs, 360, top…), used as a reusable label on Strategies and Gear needs. Each Duty belongs to exactly one Zone and has a place in that Zone's run order. The same Duty can belong to different Roles depending on the Strategy. Its label is the community's English shorthand, used as-is in both languages.
_Avoid_: job, task

**Strategy**:
A way to clear a Zone with a given team (T2Way, roll-way, 4-man TUF-way…). Lists which Roles take part, the Build each one runs and the Duties each one carries, in route order. Has a page, and credits its source when it documents someone else's work. Each Zone has one default Strategy.
_Avoid_: party setup (former name), tactic, comp, team size

**Gear**:
One piece of equipment: a weapon (base type plus mods), a rune or an insignia. Catalog data with no page of its own; it links to the Guild Wars Wiki.
_Avoid_: equipment, items (too broad — includes Consumables)

**Gear set**:
Gear that is put on together. An **armor set** gives, per armor slot it covers, the insignia, rune and (headpiece) attribute; it can be full or partial (a headpiece alone), and when swapped in it overrides the base armor for those slots only. A **weapon set** is what fills one weapon-set slot (a two-hander, or main hand plus off-hand).
_Avoid_: kit, outfit

**Loadout**:
What a Build core or Build wears by default: one base armor set and the weapon sets it carries. A Build's armor set replaces its core's; weapon sets add up. It says what is worn, not how necessary extra Gear is; that is a Gear need.
_Avoid_: equipment, setup

**Gear need**:
A Gear set bound to a Build core or Build with a level (required, recommended, optional), for given Duties (none = always), optionally with a reason. A Build inherits its core's Gear needs. Combining the Gear needs of a Role's Build over the Duties it carries in a Strategy gives what that Role brings.
_Avoid_: requirement (that is for Consumables)

**Skill**:
A skill as the game defines it, with its official name and description in each language. Authors never write or translate skill text; commentary about a skill belongs to the Build that uses it. A Skill may have a community nickname (IAU, stab, battle stand), shared across both languages.

**Consumable**:
A single-use item used during a run. Kinds: cons (Essence, Grail, Armor), summoning stones, powerstones, sweets/alcohol, and other.
_Avoid_: cons (one kind of Consumable), pcons

**Requirement**:
A rule saying how necessary a Consumable is in a given context: level required, recommended, or optional, attached to a Zone, a Strategy, a Role, or a Duty, optionally with a short reason. Consumables are catalog data with no page; they link to the Guild Wars Wiki.
_Avoid_: prerequisite, must-have

## Relationships

- A **Zone** has one or more **Roles**, an ordered list of **Duties**, and one or more **Strategies**, one of which is the default
- A **Strategy** gives each **Role** taking part one **Build** (unless the source publishes none) and its **Duties**
- Which **Build** a **Role** runs and which **Duties** it carries depend on the **Strategy**; several **Roles** may run the same **Build**
- A **Duty** may appear under different **Roles** across **Strategies**
- A **Build** derives from exactly one **Build core** and swaps some of its slots
- A **Build core** and each **Build** have a **Loadout** (base armor set + weapon sets) and **Gear needs** (Gear sets by Duty and level)
- A **Gear set** is made of **Gear**; a **Consumable** carries zero or more **Requirements**, each targeting one **Zone**, **Strategy**, **Role**, or **Duty**

## Example dialogue

> **Dev:** "Is griffs part of v2?"
> **Player:** "Depends on the **Strategy** — the **Duty** moves between **Roles** when the team size changes."
>
> **Dev:** "So what does the v3 bring in roll-way?"
> **Player:** "Its VoS base **Loadout**, plus every **Gear need** of its **Build** for the **Duties** it carries there: the Forsaken armor for backway, the slashing shield for the bridge."
