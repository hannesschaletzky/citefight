export interface Twitter_User {
    id: bigint;
    screen_name: string;
    name: string;
    followers_count: bigint;
    verified: boolean;
    statuses_count: number;
    profile_image_url_https: string;
}