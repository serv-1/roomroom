import { GiphyFetch } from "@giphy/js-fetch-api";
import env from "./env";

const giphy = new GiphyFetch(env.GIPHY_API_KEY);

export default giphy;
