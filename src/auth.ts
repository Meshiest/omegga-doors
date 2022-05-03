import { Config } from './config';

/** check if a player is authorized by config */
export const isAuthorized = (
  config: Config,
  playerId: string,
  mode?: 'use' | 'create'
) => {
  const hasRole = () =>
    Player.getRoles(Omegga, playerId).includes(config['authorized-role']);
  const isAuthorizedUser = () =>
    config['authorized-users'].some(u => u.id === playerId);
  return (
    (mode === 'create' &&
      (!config['create-only-authorized'] || hasRole() || isAuthorizedUser())) ||
    (mode === 'use' &&
      (!config['use-only-authorized'] || hasRole() || isAuthorizedUser())) ||
    (!mode && (hasRole() || isAuthorizedUser()))
  );
};
