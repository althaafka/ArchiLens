export const edgesLabel = {
    CONTAINS: 'contains',
    CALLS: 'calls',
    CONSTRUCTS: 'constructs',
    HOLDS: 'holds',
    ACCEPTS: 'accepts',
    SPECIALIZES: 'specializes',
    RETURNS: 'returns',
    ACCESSES: 'accesses',
} as const

export const detailedNodesLabel = {
    OPERATION: "Operation", 
    CONSTRUCTOR: "Constructor", 
    SCRIPT: "Script", 
    VARIABLE: "Variable",
    GROUPING: "Grouping",
    FEATURE: "Feature",
} as const