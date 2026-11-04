// Publishing from a private repository can still expose every game resource.
// Called by the deployment job after fetching real repository/site metadata.
export function assertPagesDeploymentAllowed({repositoryPrivate,sitePublic,publicApproved}) {
  if(repositoryPrivate!==true)throw new Error('Repository must remain private. Refusing Pages deployment.');
  if(typeof sitePublic!=='boolean')throw new Error('Cannot verify Pages visibility. Refusing deployment.');
  if(sitePublic&&publicApproved!==true)throw new Error('This Pages site is public. Explicit approval to expose the personal story is required.');
  return true;
}
