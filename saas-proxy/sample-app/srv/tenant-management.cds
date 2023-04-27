
@protocol: 'rest'
@(requires: ['cds.Subscriber', 'mtcallback', 'internal-user'])
@(path:'/-/cds/saas-provisioning')
service TenantManagement{

    @open
    @cds.persistence.skip
    entity tenant {
        key subscribedTenantId : String @assert.format: '^[^\*]+$';
            subscribedSubaccountId : UUID;
            subscribedSubdomain : String(256);
            subscriptionAppName : String(256); 
            eventType: String(64); 
    }

    function dependencies() returns array of { xsappname: String };
}