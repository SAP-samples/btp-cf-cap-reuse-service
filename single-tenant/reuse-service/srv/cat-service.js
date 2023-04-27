const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const {
        Books
    } = this.entities;
  
  this.on("READ", Books, async(req)=> { 
    return {
        ID: 1,
        title: "Sample Book",
        stock: 10
    }
  });

  this.on('userInfo', async(req) => {

    const user = {
        id : req.user.id,
        tenant : req.tenant,
        roles: {
          user : req.user.is('User'),
          admin : req.user.is('Admin')
        },
        attr : req.user.attr
    }
    
    return user;
  });
});