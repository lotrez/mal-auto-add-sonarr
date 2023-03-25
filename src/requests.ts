import { BASIC_AUTH_HEADER, logger } from "..";
import { SeasonResponse } from "./models/JikanAnime";
import { LookupResponse } from "./models/SonarrLookup";

export const getCurrentSeason = (): Promise<SeasonResponse> =>
  fetch("https://api.jikan.moe/v4/seasons/now").then((response) =>
    response.json()
  );

export const getNextSeason = (): Promise<SeasonResponse> =>
  fetch("https://api.jikan.moe/v4/seasons/upcoming?filter=tv").then(
    (response) => response.json()
  );

export const addAnimeToSonarr = async (anime: LookupResponse) =>
  fetch(`${process.env.SONARR_API_URL}/v3/series`, {
    method: "POST",
    headers: {
      Authorization: BASIC_AUTH_HEADER,
      "x-api-key": process.env.SONARR_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(anime),
  }).then(async (response) => {
    if (response.status === 201) logger.info(`Added ${anime.title} to sonarr`);
    else
      logger.error(
        `Error while adding ${anime.title} to sonarr: ${
          response.status
        }, ${await response.text()}`
      );
  });

export const searchAnimeOnSonarr = async (
  animeName: string
): Promise<LookupResponse[]> =>
  fetch(`${process.env.SONARR_API_URL}/v3/series/lookup?term=${animeName}`, {
    headers: {
      Authorization: BASIC_AUTH_HEADER,
      "x-api-key": process.env.SONARR_API_KEY || "",
    },
  })
    .then(async (response) => {
      if (response.status === 200) return response.json();
      else
        throw new Error(
          `Error while searching anime: ${
            response.status
          }, ${await response.text()}`
        );
    })
    .catch((err) => logger.error(err));
