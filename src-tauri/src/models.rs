use serde::{Serialize, Deserialize};

use crate::schema::*;

#[derive(Queryable, Insertable, Serialize, Deserialize)]
#[table_name="complexes"]
pub struct Complex {
    pub complex_name: String,
    pub city: String,
    pub post_code: String,
    pub district: String, // comune
}

#[derive(Queryable, Serialize, Deserialize)]
pub struct House {
    pub house_id: i32,
    pub complex_id: i32,
    pub house_name: String,
    pub street_type: String,
    pub street_name: String,
    pub street_number: i32
}

#[derive(Queryable, Serialize, Deserialize)]
pub struct Apartment {
    pub apartment_id: i32,
    pub house_id: i32,
    pub apartment_number: i32,
    pub square_meters: i32,
    pub price: i32,
    pub n_rooms: i32
}

#[derive(Queryable, Serialize, Deserialize)]
pub struct Guest {
    pub tax_code: String, // codice fiscale
    pub first_name: String,
    pub last_name: String,
    pub birthplace: String,
    pub birth_date: chrono::NaiveDate,
    pub phone_number: Option<String>
}

#[derive(Insertable, Serialize)]
#[table_name="guests"]
pub struct NewGuest<'a> {
    pub tax_code: String,
    pub first_name: String,
    pub last_name: String,
    pub birthplace: String,
    pub birth_date: &'a chrono::NaiveDate,
    pub phone_number: Option<String>
}

#[derive(Queryable, Serialize, Deserialize)]
pub struct Group {
    pub id: i32,
    pub nickname: Option<String>
}

#[derive(Insertable, Serialize, Deserialize)]
#[table_name="groups"]
pub struct NewGroup {
    pub nickname: Option<String>
}

#[derive(Queryable, Insertable, Serialize, Deserialize, Associations)]
#[belongs_to(Guest, foreign_key="guest_tax_code")]
#[table_name="documents"]
pub struct Document {
    pub guest_tax_code: String, // codice fiscale
    pub doc_type: String,
    pub number: String,
    pub district: String,
    pub city_residence: String,
    pub nationality: String
}

#[derive(Queryable, Insertable, Serialize, Deserialize, Associations)]
#[belongs_to(Guest, foreign_key="guest_tax_code")]
#[belongs_to(Group)]
#[table_name="guests_group"]
pub struct GuestGroup {
    pub guest_tax_code: String, // codice fiscale
    pub group_id: i32
}

#[derive(Queryable, Serialize, Deserialize)]
pub struct Rent {
    pub id: i32,
    pub start_date: chrono::NaiveDate,
    pub end_date: chrono::NaiveDate,
    pub total_price: i32,
    pub paid: bool,
    pub group_id: i32,
    pub apartment_id: i32
}

#[derive(Insertable)]
#[table_name="rents"]
pub struct NewRent {
    pub start_date: chrono::NaiveDate,
    pub end_date: chrono::NaiveDate,
    pub total_price: i32,
    pub paid: bool,
    pub group_id: i32,
    pub apartment_id: i32
}
