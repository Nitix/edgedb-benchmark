module default {

    type User {
        required property email -> str {
            constraint exclusive;
        }
        property name -> str;
        multi link posts := User.<author[IS Post];
        link profile := User.<user[IS Profile];
    }

    type Post {
        required property title -> str;
        property content -> str;
        property published -> bool {
            default := false;
        }
        required link author -> User;
        index on (.author);
    }

    type Profile {
        property bio -> str;
        required link user -> User   {
            constraint exclusive;
        }
        index on (.user);
    }
}
