# Roles live inside their Strategy; Duties are grouped by Region

A Role used to be a page (`fow/roles/v1`) that kept its identity across Strategies. In practice it doesn't: the V1 of roll-way opens the forge and does Khobay, the V1 of 4-man roll-way does camp, Menzies and griffs. A shared page only said "it depends on the strategy" and pointed back at the Strategies. So a Role is now just its name inside one Strategy (`role: V1` in the Strategy's `roles`). The Strategy page already lists each Role with its recommended Build, Duties and kit. The sidebar per Zone is down to Overview, Strategies and Duties.

Consumable Requirements that targeted a Role now name its Strategy as well (`{ type: role, strategy, role }`), because a Role has no meaning outside one.

The flat Duty list is grouped by **Region**, a part of the Zone's map. The Zone lists its Regions in order (`regions`), each Duty names its own (`region`), and run order stays in the Zone's `duties`. The FoW map by Xray, from the Speedclear Wiki, is shown on the Zone page next to the Duties by Region, with credit in the caption and in the Zone's `sources`.

## Considered options

- **Keep Role pages**: they duplicated what the Strategy pages say and suggested a continuity that isn't there.
- **Regions as lists of Duties in the Zone**: that would be a second list of the same Duties next to run order. One `region` field per Duty keeps each fact in one place.

## Consequences

- Duty pages no longer have the Role × Strategy matrix. "Who does it, with which build" lists Strategy · Role · Build instead.
- A Build page lists the (Strategy, Role) pairs that run it as text, with only the Strategy linked.
- Region names are the in-game English area names, the same in both languages, apart from the catch-all ("Toute la zone" / "Whole zone").
