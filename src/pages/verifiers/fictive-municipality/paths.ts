export const BASE_PATH = "/verifiers/fictive-municipality";

export const PATHS = {
  home: BASE_PATH,
  product: `${BASE_PATH}/market-stall-permit`,
  login: `${BASE_PATH}/login`,
  application: `${BASE_PATH}/application`,
  confirmation: `${BASE_PATH}/confirmation`,
} as const;
