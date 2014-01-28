// provide both global signals and local signals with minimal API
// global: `Eventi.signal([target, ]'type');` -> `Eventi.on.type([target, ]handler)`
// local (upon ify-cation): `Eventi.fy(target, 'type', 'type2')` -> `target.until.type2(1, handler)`
// implementation should basically insert signal type as event at proper args index (_.wrap will have to expose index, for this to work)
// obviously, signals cannot have the same name as Function properties like 'call' or 'length'
