namespace my.bookshop;

@cds.persistence.skip
entity Books {
  key ID : Integer;
  title: String;
  stock: Integer
}
