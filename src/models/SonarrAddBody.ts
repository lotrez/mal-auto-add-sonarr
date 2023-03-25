export interface SonarrAddBody {
  title: string;
  sortTitle: string;
  status: string;
  ended: boolean;
  overview: string;
  network: string;
  airTime: string;
  images: Image[];
  remotePoster: string;
  seasons: Season[];
  year: number;
  qualityProfileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  runtime: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: string;
  seriesType: string;
  cleanTitle: string;
  imdbId: string;
  titleSlug: string;
  folder: string;
  certification: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: Ratings;
  statistics: Statistics;
  addOptions: AddOptions;
  rootFolderPath: string;
}

interface AddOptions {
  monitor: string;
  searchForMissingEpisodes: boolean;
  searchForCutoffUnmetEpisodes: boolean;
}

interface Statistics {
  seasonCount: number;
  episodeFileCount: number;
  episodeCount: number;
  totalEpisodeCount: number;
  sizeOnDisk: number;
  percentOfEpisodes: number;
}

interface Ratings {
  votes: number;
  value: number;
}

interface Season {
  seasonNumber: number;
  monitored: boolean;
}

interface Image {
  coverType: string;
  url: string;
  remoteUrl: string;
}
