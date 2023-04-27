using my.bookshop as my from '../db/data-model';

service CatalogService {
    
    @readonly 
    @cds.persistence.skip
    entity Books as projection on my.Books;

    function tenantInfo() returns String;
}


