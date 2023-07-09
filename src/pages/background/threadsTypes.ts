export interface ThreadsUser {
  is_private: boolean;
  profile_pic_url: string;
  username: string;
  hd_profile_pic_versions: ThreadsHdProfilePicVersion[];
  is_verified: boolean;
  biography: string;
  biography_with_entities: any;
  follower_count: number;
  profile_context_facepile_users: any;
  bio_links: ThreadsBioLink[];
  pk: string;
  full_name: string;
  id: any;
}
export interface ThreadsHdProfilePicVersion {
  height: number;
  url: string;
  width: number;
}
export interface ThreadsBioLink {
  url: string;
}

export interface ThreadsUserSummary {
  profile_pic_url: string;
  username: string;
  id: any;
  is_verified: boolean;
  pk: string;
}

export interface VideoVersion {
  type: number;
  url: string;
  __typename: string;
}

export interface Caption {
  text: string;
}

export interface Extensions {
  is_final: boolean;
}
