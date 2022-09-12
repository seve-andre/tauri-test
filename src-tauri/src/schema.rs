table! {
    apartments (apartment_id) {
        apartment_id -> Integer,
        house_id -> Integer,
        apartment_number -> Integer,
        square_meters -> Integer,
        price -> Integer,
        n_rooms -> Integer,
    }
}

table! {
    complexes (complex_id) {
        complex_id -> Integer,
        complex_name -> Text,
        city -> Text,
        post_code -> Text,
        district -> Text,
    }
}

table! {
    documents (doc_type, number) {
        guest_tax_code -> Text,
        doc_type -> Text,
        number -> Text,
        district -> Text,
        city_residence -> Text,
        nationality -> Text,
    }
}

table! {
    groups (id) {
        id -> Integer,
        nickname -> Nullable<Text>,
    }
}

table! {
    guests (tax_code) {
        tax_code -> Text,
        first_name -> Text,
        last_name -> Text,
        birthplace -> Text,
        birth_date -> Date,
        phone_number -> Nullable<Text>,
    }
}

table! {
    guests_group (guest_tax_code, group_id) {
        guest_tax_code -> Text,
        group_id -> Integer,
    }
}

table! {
    houses (house_id) {
        house_id -> Integer,
        complex_id -> Integer,
        house_name -> Text,
        street_type -> Text,
        street_name -> Text,
        street_number -> Integer,
    }
}

table! {
    rents (id) {
        id -> Integer,
        start_date -> Date,
        end_date -> Date,
        total_price -> Integer,
        paid -> Bool,
        group_id -> Integer,
        apartment_id -> Integer,
    }
}

joinable!(apartments -> houses (house_id));
joinable!(documents -> guests (guest_tax_code));
joinable!(guests_group -> groups (group_id));
joinable!(guests_group -> guests (guest_tax_code));
joinable!(houses -> complexes (complex_id));
joinable!(rents -> apartments (apartment_id));
joinable!(rents -> groups (group_id));

allow_tables_to_appear_in_same_query!(
    apartments,
    complexes,
    documents,
    groups,
    guests,
    guests_group,
    houses,
    rents,
);
