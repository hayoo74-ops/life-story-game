import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertPagesDeploymentAllowed as check} from '../scripts/pages-policy.mjs';
test('public Pages never deploys without explicit story publication consent',()=>{
 for(const publicApproved of [undefined,false,'false','true'])assert.throws(()=>check({repositoryPrivate:true,sitePublic:true,publicApproved}),/Explicit approval/);
 assert.equal(check({repositoryPrivate:true,sitePublic:true,publicApproved:true}),true);
});
test('verified private Pages can deploy without approving public exposure',()=>assert.equal(check({repositoryPrivate:true,sitePublic:false,publicApproved:false}),true));
test('Pages deployment cannot make a public or unknown repository acceptable',()=>{
 for(const repositoryPrivate of [false,undefined,'true'])assert.throws(()=>check({repositoryPrivate,sitePublic:false,publicApproved:true}),/remain private/);
});
test('unknown site visibility fails closed even if public exposure was approved',()=>{
 for(const sitePublic of [null,undefined,'false'])assert.throws(()=>check({repositoryPrivate:true,sitePublic,publicApproved:true}),/verify Pages visibility/);
});
