export const LOCATION_QUERY_KEYS = {
  LOCATIONS: "organization-locations",
  LOCATION: "organization-location",
  CREATE_LOCATION: "organization-create-location",
  UPDATE_LOCATION: "organization-update-location",
  DELETE_LOCATION: "organization-delete-location",
} as const;

export const GET_LOCATIONS = LOCATION_QUERY_KEYS.LOCATIONS;
export const GET_LOCATION = LOCATION_QUERY_KEYS.LOCATION;
export const CREATE_LOCATION = LOCATION_QUERY_KEYS.CREATE_LOCATION;
export const UPDATE_LOCATION = LOCATION_QUERY_KEYS.UPDATE_LOCATION;
export const DELETE_LOCATION = LOCATION_QUERY_KEYS.DELETE_LOCATION;
