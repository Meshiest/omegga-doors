export type Config = {
  'create-only-authorized': boolean;
  'use-only-authorized': boolean;
  'authorized-users': { id: string; name: string }[];
  'authorized-role': string;
  'allow-one-way': boolean;
  'allow-destruction': boolean;
  'allow-private': boolean;
  'allow-password': boolean;
  'allow-disabled': boolean;
  'allow-triggers': boolean;
  'authorized-unlock': boolean;
  'anti-spam-throttle': number;
  'max-door-bricks': number;
  'max-door-size': number;
  'max-door-shift': number;
};
