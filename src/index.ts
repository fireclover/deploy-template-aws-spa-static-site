#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { StaticSite } from './static-site';

/**
 * This stack relies on getting the domain name from CDK context.
 * Use 'cdk synth -c domain=mystaticsite.com -c subdomain=www'
 * Or add the following to cdk.json:
 * {
 *   "context": {
 *     "domain": "mystaticsite.com",
 *     "subdomain": "www",
 *     "accountId": "1234567890",
 *     "webPath": "../web/dist",
 *   }
 * }
**/
class MyStaticSiteStack extends cdk.Stack {
    constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
        super(parent, name, props);

        const prepath = this.node.tryGetContext('webPath').toString().includes('test') ? '' : '../';
        new StaticSite(this, 'StaticSite', {
            domainName: this.node.tryGetContext('domain'),
            siteSubDomain: this.node.tryGetContext('subdomain'),
            webPath: prepath + this.node.tryGetContext('webPath'),
            folderRedirects: this.node.tryGetContext('folderRedirects'),
        });
    }
}

const app = new cdk.App();

new MyStaticSiteStack(app, `MyStaticSite-${app.node.tryGetContext('subdomain')}`, {
    /**
     * This is required for our use of hosted-zone lookup.
     *
     * Lookups do not work at all without an explicit environment
     * specified; to use them, you must specify env.
     * @see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
     */
    env: {
        account: app.node.tryGetContext('accountId'),
        /**
         * Stack must be in us-east-1, because the ACM certificate for a
         * global CloudFront distribution must be requested in us-east-1.
         */
        region: app.node.tryGetContext('region') || 'us-east-1',

    }
});

app.synth();
