const cds = require('@sap/cds');
const xsenv = require('@sap/xsenv');

module.exports = cds.service.impl(async function () {
    const { Tenant } = this.entities;

    this.on("UPDATE", Tenant, async (req) => {
        console.log("Subscription data:",JSON.stringify(req.data));
        
        let tenantSubdomain = req.data.subscribedSubdomain;
        const tenantURL = `https://${tenantSubdomain}-${process.env.appDomain}`;
        
        return tenantURL;
    });

    this.on("DELETE", Tenant, async(req) => {
        console.log('Unsubscribe Data: ', JSON.stringify(req.data));
        return req.data.subscribedTenantId;
    })

    this.on("dependencies", async (req)=> {
        let dependencies = [];

        const services = xsenv.getServices({
            html5Runtime: { tag: 'html5-apps-repo-rt' },
            destination: { tag: 'destination' }
        });

        dependencies.push({ xsappname: services.html5Runtime.uaa.xsappname });
        dependencies.push({ xsappname: services.destination.xsappname });

        console.log("SaaS Dependencies:", JSON.stringify(dependencies));
        return dependencies;
    });
});