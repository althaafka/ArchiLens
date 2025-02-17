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

export const stereoTypesColors = {
    "Controller": "#FFE8E2",
    "Information Holder": "#FFF2DD",
    "Interfacer": "#E7F5E9",
    "User Interfacer": "#E7F5E9",
    "Internal Interfacer": "#E7F5E9",
    "Eksternal Interfacer": "#E7F5E9",
    "Service Provider": "#E2EFFC",
    "Structurer": "#EFE6FF",
    "Coordinator": "#FFD9DF",
    "-":"#F2F2F2"
} as const
  
export const stereoTypesBorder = {
    "Controller": "#FF8861",
    "Information Holder": "#FEBA4C",
    "Interfacer": "#81C880",
    "User Interfacer": "#81C880",
    "Internal Interfacer": "#81C880",
    "Eksternal Interfacer": "#81C880",
    "Service Provider": "#5EAAED",
    "Structurer": "#bb91e3",
    "Coordinator": "#FFB2C7",
    "-":"#5E5E5E"
} as const