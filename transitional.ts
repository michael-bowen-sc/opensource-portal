//
// Copyright (c) Microsoft.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
//

'use strict';

// Transitional interfaces

import { Application, Response, Request } from 'express';

import redis from 'redis';
import { Pool as PostgresPool } from 'pg';

import { IndividualContext } from './user';
import { ICorporateLink } from './business/corporateLink';
import { ILinkProvider } from './lib/linkProviders/postgres/postgresLinkProvider';
import { IEntityMetadataProvider } from './lib/entityMetadataProvider/entityMetadataProvider';
import { IApprovalProvider } from './entities/teamJoinApproval/approvalProvider';
import { Operations } from './business/operations';
import { ITokenProvider } from './entities/token';
import { IMailAddressProvider } from './lib/mailAddressProvider';
import { IRepositoryMetadataProvider } from './entities/repositoryMetadata/repositoryMetadataProvider';
import { RedisHelper } from './lib/redis';
import { ILocalExtensionKeyProvider } from './entities/localExtensionKey';
import { PersonalAccessToken } from './entities/token/token';
import { Organization } from './business/organization';
import { IGraphProvider } from './lib/graphProvider';
import { RestLibrary } from './lib/github';
import { Team } from './business/team';
import { IRepositoryCacheProvider } from './entities/repositoryCache/repositoryCacheProvider';
import { IRepositoryCollaboratorCacheProvider } from './entities/repositoryCollaboratorCache/repositoryCollaboratorCacheProvider';
import { ITeamCacheProvider } from './entities/teamCache/teamCacheProvider';
import { ITeamMemberCacheProvider } from './entities/teamMemberCache/teamMemberCacheProvider';
import { IRepositoryTeamCacheProvider } from './entities/repositoryTeamCache/repositoryTeamCacheProvider';
import { IOrganizationMemberCacheProvider } from './entities/organizationMemberCache/organizationMemberCacheProvider';
import { AppPurpose } from './github';
import QueryCache from './business/queryCache';
import { IMailProvider } from './lib/mailProvider';
import { GitHubRepositoryPermission } from './entities/repositoryMetadata/repositoryMetadata';
import { IOrganizationSettingProvider } from './entities/organizationSettings/organizationSettingProvider';

export interface ICallback<T> {
  (error: IReposError, result?: T): void;
}

export interface IGetOwnerToken {
  (): string;
}

export interface IPurposefulGetAuthorizationHeader {
  (purpose: AppPurpose): Promise<IAuthorizationHeaderValue>;
}

export interface IAuthorizationHeaderValue {
  value: string;
  purpose: AppPurpose;
  source?: string;
}

export interface IGetAuthorizationHeader {
  (): Promise<IAuthorizationHeaderValue>;
}

export interface PromiseResolve<T> {
  (resolve: T[]): void;
}

export interface PromiseReject {
  (reject?: any): void;
}

export interface ICacheOptions {
  backgroundRefresh?: any | null | undefined;
  maxAgeSeconds?: number | null | undefined;
}

export interface IPagedCacheOptions extends ICacheOptions {
  pageRequestDelay?: number | null | undefined; // FUTURE: could be a function, too
}

export interface IPagedCrossOrganizationCacheOptions extends IPagedCacheOptions {
  individualMaxAgeSeconds?: number | null | undefined;
  individualRequestDelay?: number | null | undefined; // FUTURE: could be a function, too
}

export interface ILocalCacheOptions extends ICacheOptions {
  localMaxAgeSeconds?: number;
}

export interface ICacheOptionsPageLimiter extends ICacheOptions {
  pageLimit?: number;
}

export interface IMapPlusMetaCost extends Map<any, any> {
  headers?: any;
  cost?: IReposRestRedisCacheCost;
}

export interface IReposRestRedisCacheCost {
  github: {
    cacheHits: number;
    remainingApiTokens: string;
    restApiCalls: number;
    usedApiTokens: number;
  };
  local: {
    cacheHits: number;
    cacheMisses: number;
  };
  redis: {
    cacheHits: number;
    cacheMisses: number;
    expireCalls: number;
    getCalls: number;
    setCalls: number;
  };
}

export interface IClassicLink {
  ghu: string;
  ghid: string; // ?
  aadupn: string;
  aadname?: string;
  aadoid: string;
  ghavatar?: string;
  githubToken?: string;
  githubTokenUpdated?: any;
  githubTokenIncreasedScope?: string;
  githubTokenIncreasedScopeUpdated?: any;
  joined?: Date;
  serviceAccount?: boolean;
}

export interface IProviders {
  approvalProvider?: IApprovalProvider;
  basedir?: string;
  config?: any;
  // entityMetadata?: IEntityMetadataProvider;
  healthCheck?: any;
  keyEncryptionKeyResolver?: any;
  github?: RestLibrary;
  graphProvider?: IGraphProvider;
  insights?: any;
  linkProvider?: ILinkProvider;
  localExtensionKeyProvider?: ILocalExtensionKeyProvider;
  mailAddressProvider?: IMailAddressProvider;
  mailProvider?: IMailProvider;
  operations?: Operations;
  organizationMemberCacheProvider?: IOrganizationMemberCacheProvider;
  organizationSettingsProvider?: IOrganizationSettingProvider;
  postgresPool?: PostgresPool;
  queryCache?: QueryCache;
  redis?: RedisHelper;
  redisClient?: redis.RedisClient;
  repositoryCacheProvider?: IRepositoryCacheProvider;
  repositoryCollaboratorCacheProvider?: IRepositoryCollaboratorCacheProvider;
  repositoryMetadataProvider?: IRepositoryMetadataProvider;
  repositoryTeamCacheProvider?: IRepositoryTeamCacheProvider;
  teamCacheProvider?: ITeamCacheProvider;
  teamMemberCacheProvider?: ITeamMemberCacheProvider;
  witnessRedis?: redis.RedisClient;
  witnessRedisHelper?: RedisHelper;
  tokenProvider?: ITokenProvider;
}

export interface RedisOptions {
  auth_pass: string;
  detect_buffers: boolean;
  tls?: {
    servername: string;
  }
}

export interface InnerError extends Error {
  inner?: Error;
}

export interface IReposError extends Error {
  skipLog?: boolean;
  status?: any; // status?: number;
  code?: any; // not sure this is used any longer by libraries
  originalUrl?: any;
  detailed?: any;
  redirect?: string;
  skipOops?:boolean;
  fancyLink?: {
    link: string;
    title: string;
  };
  innerError?: IReposError;
}

export interface Application extends Application {
  // Standard Express
  set(settingName: string, settingValue: any);

  // Local things
  providers: IProviders;
}

export interface IReposAppContext {
  section?: string;
  pivotDirectlyToOtherOrg?: string;
  releaseTab?: boolean;
  organization?: Organization;
}

export interface IReposAppWithTeam extends ReposAppRequest {
  teamPermissions?: any;
  team2?: Team;
  teamUrl: string;
}

export interface ReposAppRequest extends Request {
  // passport
  isAuthenticated(): boolean;
  user: any;

  // our extensions
  insights?: any;
  reposContext?: IReposAppContext;
  currentOrganizationMemberships?: any; // needs a redesign
  teamsPagerMode?: string;
  reposPagerMode?: string;
  link?: any; // not sure when this is set
  organization?: Organization;
  correlationId?: string;

  // FUTURE:
  apiContext: IndividualContext;
  individualContext: IndividualContext;
}

export interface IReposAppResponse extends Response {
}

export interface IReposRequestWithOrganization extends ReposAppRequest {
  organization?: any;
}

export interface IRequestTeams extends ReposAppRequest {
  team2?: any;
  teamUrl?: any;
}

export interface RequestWithSystemwidePermissions extends ReposAppRequest {
  systemWidePermissions?: any;
}

export interface IResponseForSettingsPersonalAccessTokens extends Response {
  newKey?: string;
}

export function translateNewLinksArrayToOldTemporarily(links: ICorporateLink[]): IClassicLink[] {
  return links.map(translateNewLinkFormatToOldTemporarily) as any[] as IClassicLink[];
}

export function translateNewLinkFormatToOldTemporarily(link: ICorporateLink): IClassicLink {
  const ancientLink: IClassicLink = {
    aadoid: link.corporateId,
    aadupn: link.corporateUsername,
    ghu: link.thirdPartyUsername,
    ghid: link.thirdPartyId,
    ghavatar: link.thirdPartyAvatar,
    serviceAccount: link.isServiceAccount,
  };
  return ancientLink;
}

// Not used... yet.

interface ITooManyLinksError extends Error {
  links?: any;
  tooManyLinks?: boolean;
}

interface IExistingIdentityError extends Error {
  anotherAccount?: boolean;
  link?: any;
  skipLog?: boolean;
}

function tooManyLinksError(self, userLinks, callback) {
  const tooManyLinksError: ITooManyLinksError = new Error(`This account has ${userLinks.length} linked GitHub accounts.`);
  tooManyLinksError.links = userLinks;
  tooManyLinksError.tooManyLinks = true;
  return callback(tooManyLinksError, self);
}

function existingGitHubIdentityError(self, link, requestUser, callback) {
  const endUser = requestUser.azure.displayName || requestUser.azure.username;
  const anotherGitHubAccountError: IExistingIdentityError = new Error(`${endUser}, there is a different GitHub account linked to your corporate identity.`);
  anotherGitHubAccountError.anotherAccount = true;
  anotherGitHubAccountError.link = link;
  anotherGitHubAccountError.skipLog = true;
  return callback(anotherGitHubAccountError, self);
}

export function SettleToStateValue<T>(promise: Promise<T>): Promise<ISettledValue<T>> {
  return promise.then(value => {
    return { value, state: SettledState.Fulfilled };
  }, reason => {
    return { reason, state: SettledState.Rejected };
  });
}

export function permissionsObjectToValue(permissions): GitHubRepositoryPermission {
  if (permissions.admin === true) {
    return GitHubRepositoryPermission.Admin;
  } else if (permissions.push === true) {
    return GitHubRepositoryPermission.Push;
  } else if (permissions.pull === true) {
    return GitHubRepositoryPermission.Pull;
  }
  throw new Error(`Unsupported GitHubRepositoryPermission value inside permissions`);
}

export function isPermissionBetterThan(currentBest, newConsideration) {
  switch (newConsideration) {
  case 'admin':
    return true;
  case 'push':
    if (currentBest !== 'admin') {
      return true;
    }
    break;
  case 'pull':
    if (currentBest === null) {
      return true;
    }
    break;
  default:
    throw new Error(`Invalid permission type ${newConsideration}`);
  }
  return false;
}

export function MassagePermissionsToGitHubRepositoryPermission(value: string): GitHubRepositoryPermission {
  // collaborator level APIs return a more generic read/write value, lead to some bad caches in the past...
  // TODO: support new collaboration values as they come online for Enterprise Cloud!
  switch (value) {
    case 'write':
    case 'push':
      return GitHubRepositoryPermission.Push;
    case 'admin':
      return GitHubRepositoryPermission.Admin;
    case 'pull':
    case 'read':
        return GitHubRepositoryPermission.Pull;
    default:
      throw new Error(`Invalid ${value} GitHub repository permission [massagePermissionsToGitHubRepositoryPermission]`);
  }
}

export interface ISettledValue<T> {
  reason?: any;
  value?: T;
  state: SettledState;
}

export enum SettledState {
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}
