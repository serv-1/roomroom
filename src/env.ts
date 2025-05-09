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
  PG_CONN_STR: getEnvVar("PG_CONN_STR"),
  SERVER_URL: getEnvVar("SERVER_URL"),
  CLIENT_URL: getEnvVar("CLIENT_URL"),
  CLIENT_DOMAIN: getEnvVar("CLIENT_DOMAIN"),
  PORT: getEnvVar("PORT"),
  GOOGLE_ID: getEnvVar("GOOGLE_ID"),
  GOOGLE_SECRET: getEnvVar("GOOGLE_SECRET"),
  AWS_REGION: getEnvVar("AWS_REGION"),
  AWS_ACCESS_KEY_ID: getEnvVar("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnvVar("AWS_SECRET_ACCESS_KEY"),
  AWS_BUCKET: getEnvVar("AWS_BUCKET"),
};

export default env;
