import stringSimilarity from "string-similarity";
import { BASIC_AUTH_HEADER, logger } from "..";
import { SeasonResponse } from "./models/JikanAnime";
import { SonarrAddBody } from "./models/SonarrAddBody";
import { LookupResponse } from "./models/SonarrLookup";

interface RatedResponse extends LookupResponse {
  rating: number;
}

export const addSeason = async (season: "current" | "next") => {
  logger.info("Getting current season");
  const seasonData =
    season === "current" ? await getCurrentSeason() : await getNextSeason();
  logger.info(`Got ${seasonData.data.length} animes`);
  await Promise.all(
    seasonData.data.map(
      async (anime) =>
        new Promise(async (resolve) => {
          const title = anime.title_english || anime.title;
          const sonarrResponse = await searchAnimeOnSonarr(title);
          const ratedSonarrResponse: RatedResponse[] = sonarrResponse.map(
            (anime: LookupResponse) => {
              return {
                ...anime,
                rating: stringSimilarity.compareTwoStrings(title, anime.title),
              };
            }
          );
          const sortedSonarrResponse = ratedSonarrResponse.sort(
            (a, b) => b.rating - a.rating
          );
          const selectedAnime = sortedSonarrResponse[0];
          logger.info(
            `First result: ${selectedAnime.title} for ${title}, similarity: ${selectedAnime.rating}`
          );
          const animeToAdd: SonarrAddBody = {
            ...selectedAnime,
            rootFolderPath: process.env.ANIME_FOLDER_PATH || "",
            overview: selectedAnime.overview || "",
            airTime: selectedAnime.airTime || "",
            qualityProfileId: 1,
            seriesType: "anime",
            languageProfileId: 1,
            remotePoster: selectedAnime.remotePoster || "",
            imdbId: selectedAnime.imdbId || "",
            certification: selectedAnime.certification || "",
            tags:
              process.env.ANIME_RELEASE_TAG !== undefined
                ? [parseInt(process.env.ANIME_RELEASE_TAG)]
                : [],
            addOptions: {
              monitor: "all",
              searchForCutoffUnmetEpisodes: false,
              searchForMissingEpisodes: true,
            },
          };
          return await addAnimeToSonarr(animeToAdd);
        })
    )
  );
};

const getCurrentSeason = (): Promise<SeasonResponse> =>
  fetch("https://api.jikan.moe/v4/seasons/now").then((response) =>
    response.json()
  );

const getNextSeason = (): Promise<SeasonResponse> =>
  fetch("https://api.jikan.moe/v4/seasons/upcoming?filter=tv").then(
    (response) => response.json()
  );

const addAnimeToSonarr = async (anime: LookupResponse) =>
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

const searchAnimeOnSonarr = async (
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
