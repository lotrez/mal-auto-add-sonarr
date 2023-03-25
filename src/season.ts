import stringSimilarity from "string-similarity";
import { logger } from "..";
import { SonarrAddBody } from "./models/SonarrAddBody";
import { LookupResponse } from "./models/SonarrLookup";
import {
  addAnimeToSonarr,
  getCurrentSeason,
  getNextSeason,
  searchAnimeOnSonarr,
} from "./requests";

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
