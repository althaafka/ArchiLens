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

export const nodesLabel = {
    OPERATIOIN: "Operation", 
    CONSTRUCTOR: "Constructor", 
    SCRIPT: "Script", 
    VARIABLE: "Variable"
} as const