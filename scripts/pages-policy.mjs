// Source publication and publication of the game site require separate consent.
export function assertRepositoryVisibilityAllowed({repositoryPrivate,publicSourceApproved}) {
  if(repositoryPrivate!==true&&!(repositoryPrivate===false&&publicSourceApproved===true)) {
    throw new Error('Repository must remain private unless explicit public-source approval is recorded.');
  }
  return true;
}
export function assertPagesDeploymentAllowed({repositoryPrivate,sitePublic,publicApproved,publicSourceApproved}) {
  assertRepositoryVisibilityAllowed({repositoryPrivate,publicSourceApproved});
  if(typeof sitePublic!=='boolean')throw new Error('Cannot verify Pages visibility. Refusing deployment.');
  if(sitePublic&&publicApproved!==true)throw new Error('This Pages site is public. Explicit approval to expose the personal story is required.');
  return true;
}
