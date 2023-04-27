const cds = require('@sap/cds');
const HEADER_TENANT_ID = 'x-tenant-id';

module.exports = cds.service.impl(async function () {
  const { Books } = this.entities;

  this.on("READ", Books, async(req)=> { 
    try {
      const tenantId = req._.req.get(HEADER_TENANT_ID) || null;

      if(!tenantId){ req.error ({ message: 'Tenant Id missing in header!' })}
      console.log(`Tenant Id ${tenantId}`);

      return {
          ID: 1,
          title: "Sample Book",
          stock: 10
      }
      
    } catch (error) {
        console.log(error);
        req.error ({
          message: JSON.stringify(error)
        })
    }

  });

  this.on('tenantInfo', async(req) => {
    try {
      const tenantId = req._.req.get(HEADER_TENANT_ID) || null;

      if(!tenantId){ req.error ({ message: 'Tenant Id missing in header!' })}
      console.log(`Tenant Id ${tenantId}`);

      const tenant = { id : tenantId }
      return tenant;

    } catch (error) {
      console.log(error);
      req.error ({ message: JSON.stringify(error)})
  }
  });
});