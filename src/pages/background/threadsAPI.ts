import { Extensions, ThreadsUser } from "./threadsTypes";

export type GetUserProfileResponse = {
  data: {
    userData: {
      user: ThreadsUser;
    };
  };
  extensions: Extensions;
};

export type ThreadsAPIOptions = {
  fbLSDToken?: string;
  verbose?: boolean;
};

export const DEFAULT_LSD_TOKEN = "NjppQDEgONsU_1LCzrmp6q";

export class ThreadsAPI {
  fbLSDToken: string = DEFAULT_LSD_TOKEN;
  verbose = false;

  constructor(options?: ThreadsAPIOptions) {
    if (options?.fbLSDToken) {
      this.fbLSDToken = options.fbLSDToken;
    }
    this.verbose = options?.verbose || false;
  }

  _getDefaultHeaders = (username: string) => ({
    authority: "www.threads.net",
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    origin: "https://www.threads.net",
    pragma: "no-cache",
    referer: `https://www.threads.net/@${username}`,
    "x-asbd-id": "129477",
    "x-fb-lsd": this.fbLSDToken,
    "x-ig-app-id": "238260118697367",
  });

  getUserIDfromUsername = async (
    username: string,
    options?: { noUpdateLSD?: boolean }
  ): Promise<string | undefined> => {
    const res = await fetch(`https://www.threads.net/@${username}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error("Network response was not ok.");
    }

    let text: string = await res.text();
    text = text.replace(/\s/g, "");
    text = text.replace(/\n/g, "");

    const userID: string | undefined = text.match(
      /"props":{"user_id":"(\d+)"},/
    )?.[1];
    const lsdToken: string | undefined = text.match(
      /"LSD",\[\],{"token":"(\w+)"},\d+\]/
    )?.[1];

    if (!options?.noUpdateLSD && !!lsdToken) {
      this.fbLSDToken = lsdToken;
      if (this.verbose) {
        console.debug("[fbLSDToken] UPDATED", this.fbLSDToken);
      }
    }

    return userID;
  };

  getUserProfile = async (username: string, userId: string) => {
    if (this.verbose) {
      console.debug("[fbLSDToken] USING", this.fbLSDToken);
    }
    const res = await fetch("https://www.threads.net/api/graphql", {
      method: "POST",
      body: new URLSearchParams({
        lsd: this.fbLSDToken,
        variables: `{"userID":"${userId}"}`,
        doc_id: "23996318473300828",
      }),
      headers: {
        ...this._getDefaultHeaders(username),
        "x-fb-friendly-name": "BarcelonaProfileRootQuery",
      },
    });

    if (!res.ok) {
      throw new Error("Network response was not ok.");
    }

    const data: GetUserProfileResponse = await res.json();
    const user = data.data.userData.user;
    return user;
  };
}
