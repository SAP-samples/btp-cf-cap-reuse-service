const approuter = require('@sap/approuter');
const jwt = require('jsonwebtoken');
const HEADER_TENANT_ID = 'x-tenant-id';
const HEADER_COMPANY_CODE = 'x-company-code';

var ar = approuter();

ar.beforeRequestHandler.use(async function myMiddleware(req, res, next) {
    if (req.url.indexOf("/comsapdemoreuseservice/api") > -1) {  
        try {
            if (!req.user) { return res.status(403).end('Error: Missing JWT Token')};

            const authInfo = jwt.decode(req.user.token.accessToken.toString());
            if (!authInfo) { return res.status(500).end(`Error: Error decoding JWT Token`)};

            // Check if user is authorized for selected Company Code
            /*try {
                const companyCode = this.getView().byId('selectCompanyCode');

                console.log('Info: ', `Checking authorization for Company Code ${companyCode}`);
                const { data } = await axios.post(`checkCompanyCode`, { data: companyCode });

                console.log('Info: ', `User authorized for Company Code ${companyCode}`);
                console.log('Info: ', data);

            }catch(error){
                if (error.response) {
                    if(error.response.status === 401){
                        console.log('Error: ', error.response.data);
                        return res.status(401).end(`Error: Not authorized for Company Code ${companyCode}`)
                    }else{
                        console.log('Error: ', error.response.data);
                        return res.status(error.response.status).end(`Error: ${error.response.data}`)
                    }
                } else if (error.request) {
                    console.log('Error: ', error.request);
                    return res.status(500).end(`Error: An error occurred checking Company Code authorization!`)
                } else {
                    console.log('Error: ', error.message);
                    return res.status(500).end(`Error: ${error.message}`);
                }
            }*/

            const user = {
                email: authInfo.email,
                name: `${authInfo.given_name} ${authInfo.family_name}`,
                firstName: authInfo.given_name,
                familyName: authInfo.family_name,
                scopes: req.user.scopes,
                userId: authInfo.user_id,
                tenantId: req.user.tenantid,
                token: req.user.token.accessToken
            };
            console.log(`Info: User details ${JSON.stringify(user)}`);
            console.log(`Info: Tenant Id ${req.user.tenantid}`);

            req.headers[HEADER_TENANT_ID] = req.user.tenantid || '';

            next();
        } catch (error) {
            console.log(error);
            res.end(JSON.stringify(error));
        }
    } else {
        next();
        return;
    }
});

ar.start();