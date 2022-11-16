CREATE MIGRATION m14kksctuq625kpgmy276tujfzucxhc2qtjhqtaoemej6jzezch45a
    ONTO initial
{
  CREATE TYPE default::Post {
      CREATE PROPERTY content -> std::str;
      CREATE PROPERTY published -> std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY title -> std::str;
  };
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY name -> std::str;
  };
  ALTER TYPE default::Post {
      CREATE REQUIRED LINK author -> default::User;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK posts := (default::User.<author[IS default::Post]);
  };
  CREATE TYPE default::Profile {
      CREATE REQUIRED LINK user -> default::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY bio -> std::str;
  };
  ALTER TYPE default::User {
      CREATE LINK profile := (default::User.<user[IS default::Profile]);
  };
};
