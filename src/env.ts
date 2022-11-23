const getEnvVar = (name: string) => {
  const envVar = process.env[name];

  if (!envVar) {
    throw new Error('"' + name + '" environment variable is not defined!');
  }

  return envVar;
};

const env = {
  MAILJET_SENDER: getEnvVar("MAILJET_SENDER"),
  MAILJET_KEY: getEnvVar("MAILJET_KEY"),
  MAILJET_SECRET: getEnvVar("MAILJET_SECRET"),
  SECRET: getEnvVar("SECRET"),
  NODE_ENV: getEnvVar("NODE_ENV"),
  PG_HOST: getEnvVar("PG_HOST"),
  PG_USER: getEnvVar("PG_USER"),
  PG_DATABASE: getEnvVar("PG_DATABASE"),
  PG_PASSWORD: getEnvVar("PG_PASSWORD"),
  PG_PORT: getEnvVar("PG_PORT"),
  SERVER_URL: getEnvVar("SERVER_URL"),
  CLIENT_URL: getEnvVar("CLIENT_URL"),
  CLIENT_DOMAIN: getEnvVar("CLIENT_DOMAIN"),
  PORT: getEnvVar("PORT"),
  GOOGLE_ID: getEnvVar("GOOGLE_ID"),
  GOOGLE_SECRET: getEnvVar("GOOGLE_SECRET"),
};

export default env;
