# GW Knowledge Base

A bilingual (English/French) knowledge base for Guild Wars 1 PvE speedclear builds. The model is build-agnostic; the Vow of Strength Dervish is the first build documented.

## Language

**Zone**:
An elite area cleared as a run (Fissure of Woe, Shards of Orr, the Underworld).
_Avoid_: area, dungeon, map

**VoS**:
Vow of Strength, the Dervish elite skill the first documented build is centered on.

**Build core**:
The skills, attributes and Gear shared by every Build of one build family (e.g. the VoS core).
_Avoid_: base build, main build

**Build**:
A concrete skill bar plus attributes and equipment for a Role, defined as a Build core plus slot swaps.
_Avoid_: bar, template (a template is the build's import code)

**Role**:
A slot in a Zone's team composition, e.g. FoW SC's v1, v2, v3, v4.
_Avoid_: position, slot

**Duty**:
One concrete task performed during a run (ToC, camp, griffs, 360, top…), used as a reusable label on Builds and Gear. The same Duty can belong to different Roles depending on the Party setup.
_Avoid_: job, task

**Party setup**:
A team size/strategy variant for a Zone (4-man, 5-man, beachway…). Determines which Duties each Role carries.
_Avoid_: comp, team size

**Gear**:
Equipment worn or wielded: weapons, weapon sets, armor pieces, runes and insignias.
_Avoid_: equipment, items (too broad — includes Consumables)

**Consumable**:
A single-use item used during a run: cons, stones, and similar.
_Avoid_: cons (one kind of Consumable), pcons

**Requirement**:
A rule saying how necessary a Gear or Consumable is in a given context: level required, recommended, or optional, attached to a Zone, a Role, or a Duty.
_Avoid_: prerequisite, must-have

## Relationships

- A **Zone** has one or more **Roles**
- A **Role** runs a **Build** and carries a set of **Duties**
- Which **Duties** a **Role** carries depends on the **Party setup**
- A **Duty** may appear under different **Roles** across **Party setups**
- A **Build** derives from exactly one **Build core** and swaps some of its slots
- A **Gear** or **Consumable** carries zero or more **Requirements**; each targets one **Zone**, **Role**, or **Duty**

## Example dialogue

> **Dev:** "Is griffs part of v2?"
> **Player:** "Depends on the **Party setup** — the **Duty** moves between **Roles** when the team size changes."
