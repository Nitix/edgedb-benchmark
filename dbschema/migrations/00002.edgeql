CREATE MIGRATION m16lbrbhjpbtbpgfctrz4j4burpe7hlpmwzmxskkgjv5wjo6df6cha
    ONTO m14kksctuq625kpgmy276tujfzucxhc2qtjhqtaoemej6jzezch45a
{
  ALTER TYPE default::Post {
      CREATE INDEX ON (.author);
  };
  ALTER TYPE default::Profile {
      CREATE INDEX ON (.user);
  };
};
