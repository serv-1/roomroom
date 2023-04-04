const getEnvVar = (name: string) => {
  const envVar = process.env[name];

  if (!envVar) {
    throw new Error('"' + name + '" environment variable is not defined!');
  }

  return envVar;
};

const env = {
  REST_URL: getEnvVar("REACT_APP_REST_URL"),
  AWS_URL: getEnvVar("REACT_APP_AWS_URL"),
  WS_URL: getEnvVar("REACT_APP_WS_URL"),
  GIPHY_API_KEY: getEnvVar("REACT_APP_GIPHY_API_KEY"),
  AWS_REGION: getEnvVar("REACT_APP_AWS_REGION"),
  AWS_BUCKET: getEnvVar("REACT_APP_AWS_BUCKET"),
  AWS_ACCESS_KEY_ID: getEnvVar("REACT_APP_AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnvVar("REACT_APP_AWS_SECRET_ACCESS_KEY"),
};

export default env;
