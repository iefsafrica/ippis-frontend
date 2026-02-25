export const PERFORMANCE_QUERY_KEYS = {
  GOAL_TYPES: "performance-goal-types",
  CREATE_GOAL_TYPE: "performance-create-goal-type",
  UPDATE_GOAL_TYPE_STATUS: "performance-update-goal-type-status",
  DELETE_GOAL_TYPE: "performance-delete-goal-type",
  GOAL_TRACKINGS: "performance-goal-trackings",
  GOAL_TRACKING: "performance-goal-tracking",
  CREATE_GOAL_TRACKING: "performance-create-goal-tracking",
  UPDATE_GOAL_TRACKING: "performance-update-goal-tracking",
  DELETE_GOAL_TRACKING: "performance-delete-goal-tracking",
} as const;

export const GET_GOAL_TRACKINGS = PERFORMANCE_QUERY_KEYS.GOAL_TRACKINGS;
export const GET_GOAL_TRACKING = PERFORMANCE_QUERY_KEYS.GOAL_TRACKING;
export const CREATE_GOAL_TRACKING = PERFORMANCE_QUERY_KEYS.CREATE_GOAL_TRACKING;
export const UPDATE_GOAL_TRACKING = PERFORMANCE_QUERY_KEYS.UPDATE_GOAL_TRACKING;
export const DELETE_GOAL_TRACKING = PERFORMANCE_QUERY_KEYS.DELETE_GOAL_TRACKING;
