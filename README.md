# mal-auto-add-sonarr

### Description

This is a script used to add the current season or next season indexed on My Anime List to your instance of sonarr.

### How to use

Install node modules:

```node
npm i
```

You need a `.env` file in your directory with this format:

```env
SONARR_API_KEY=(API key found in sonarr settings)
SONARR_API_URL=(URL, ex: https://sonarr.yourinstance.com/api)
BASIC_AUTH_USERNAME=(if you have basic HTTP auth)
BASIC_AUTH_PASSWORD=(if you have basic HTTP auth)
ANIME_FOLDER_PATH=(path to tell sonarr where to put anime)
ANIME_RELEASE_TAG=(your release tag #)
```

For the release tag you should try adding an anime to your sonarr with your favorite settings and then setting the same in your env.

Add the current season:

```node
npx ts-node .\index.ts --action=add -s current
```

Add next season:

```node
npx ts-node .\index.ts --action=add -s next
```

### Contributing

If you wish to add features issues and PRs are welcome.

You could also compile it to js and execute, do as you wish.
