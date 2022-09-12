#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[macro_use]
extern crate diesel;
extern crate dotenv;

use diesel::update;
use lecasine::establish_connection;

pub mod schema;
pub mod models;
use diesel::insert_into;
use diesel::prelude::*;
use models::*;
use std::env;
extern crate tauri;

#[tauri::command]
fn get_houses() -> Vec<House> {
    use schema::houses::dsl::*;

    let connection = establish_connection();

    return houses
        .filter(complex_id.eq(1))
        .load::<House>(&connection)
        .expect("Error loading houses");
}

#[tauri::command]
fn get_apartments(h_id: i32) -> Vec<Apartment> {
    use schema::apartments::dsl::*;

    let connection = establish_connection();

    return apartments
        .filter(house_id.eq(h_id))
        .load::<Apartment>(&connection)
        .expect("Error loading apartments");
}

#[tauri::command]
fn get_group_id_from_rent_in_apartment(apartment_num: i32) -> i32 {
    use schema::rents::dsl::*;

    let connection = establish_connection();

    return rents
        .filter(apartment_id.eq(apartment_num))
        .filter(paid.eq(false))
        .select(group_id)
        .get_result(&connection)
        .expect("not found");
}

#[tauri::command]
fn how_many_houses() -> i64 {
    use schema::houses::dsl::*;

    let connection = establish_connection();

    return houses
        .filter(complex_id.eq(1))
        .count()
        .get_result(&connection)
        .expect("Error counting apartments");
}

#[tauri::command]
fn how_many_apartments(h_name: i32) -> i64 {
    use schema::apartments::dsl::*;

    let connection = establish_connection();

    return apartments
        .filter(house_id.eq(h_name))
        .count()
        .get_result(&connection)
        .expect("Error counting apartments");
}


#[tauri::command]
fn get_guests_in_apartment(apartment_num: i32) -> Result<Vec<Guest>, String> {
    use schema::rents::dsl::*;
    use schema::guests_group;
    use schema::rents::group_id;
    use schema::guests::dsl::*;

    let connection = establish_connection();

    let group_id_to_consider: Result<i32, String> = rents
            .filter(apartment_id.eq(apartment_num))
            .filter(paid.eq(false))
            .select(group_id)
            .limit(1)
            .get_result(&connection)
            .map_err(|e| e.to_string());

    if group_id_to_consider.is_err() {
        return Ok(vec![])
    }

    let guests_tax_codes = guests_group::table
            .filter(guests_group::group_id.eq(group_id_to_consider.expect("")))
            .select(guests_group::guest_tax_code)
            .load::<String>(&connection)
            .expect("Error finding codici fiscali");

    return guests
        .filter(tax_code.eq_any(guests_tax_codes))
        .load::<Guest>(&connection)
        .map_err(|e| e.to_string());
}

// call it when first guest is added to the apartment
#[tauri::command]
fn add_rent(
    start: String,
    end: String,
    h_name: &str,
    apartment_num: i32
) {
    use schema::rents::dsl::*;
    use schema::groups::dsl::*;

    let connection = establish_connection();

    let start_naive_date = chrono::NaiveDate::parse_from_str(&start, "%Y-%m-%d").unwrap();
    let end_naive_date = chrono::NaiveDate::parse_from_str(&end, "%Y-%m-%d").unwrap();

    // first, create group with guests
    let price = get_price_for_apartment(h_name, apartment_num);

    let group = NewGroup {nickname: None};
    insert_into(groups)
        .values(&group)
        .execute(&connection)
        .expect("Erroreeeee");

    let new_rent = NewRent {
        start_date: start_naive_date,
        end_date: end_naive_date,
        total_price: price,
        paid: false,
        // group_id: 1,
        group_id: 1,
        apartment_id: apartment_num
    };

    insert_into(rents)
        .values(&new_rent)
        .execute(&connection)
        .expect("Error adding new rent");
}

#[tauri::command]
fn get_apartment_rent(apartment_num: i32) -> Result<Rent, String> {
    use schema::rents::dsl::*;

    let connection = establish_connection();

    return rents
        .filter(apartment_id.eq(apartment_num))
        .get_result(&connection)
        .map_err(|_e| "Error finding rent".to_string());
}

fn get_last_group_id() -> i32 {
    use schema::groups::dsl::*;

    no_arg_sql_function!(
        last_insert_rowid,
        diesel::sql_types::Integer,
        "Represents the SQL last_insert_row() function"
    );

    let connection = establish_connection();

    return groups
        .select(last_insert_rowid)
        .get_result::<i32>(&connection)
        .expect("not found");
}

#[tauri::command]
fn close_rent(apartment_num: i32) {
    use schema::rents::dsl::*;

    let connection = establish_connection();

    update(rents)
        .filter(apartment_id.eq(apartment_num))
        .set(paid.eq(true))
        .execute(&connection);
}

fn get_price_for_apartment(house: &str, apartment_num: i32) -> i32 {

    use schema::apartments::dsl::*;

    let connection = establish_connection();

    apartments
        .filter(house_id.eq(1))
        .filter(apartment_number.eq(apartment_num))
        .select(price)
        .get_result(&connection)
        .expect("Price not found")
}

#[tauri::command]
fn add_guest(
    group_id: i32,
    guest_tax_code: &str,
    guest_first_name: String,
    guest_last_name: String,
    guest_birthplace: String,
    guest_birth_date: String,
    guest_optional_phone_number: Option<String>
) {
    use schema::guests::dsl::*;
    use schema::guests_group;

    let connection = establish_connection();

    let naive_birth_date = chrono::NaiveDate::parse_from_str(&guest_birth_date, "%Y-%m-%d").unwrap();

    let new_guest = NewGuest {
        tax_code: guest_tax_code.to_string(),
        first_name: guest_first_name,
        last_name: guest_last_name,
        birthplace: guest_birthplace,
        birth_date: &naive_birth_date,
        phone_number: guest_optional_phone_number
    };

    let new_guests_group = GuestGroup {
        guest_tax_code: guest_tax_code.to_string(),
        group_id
    };

    insert_into(guests)
        .values(&new_guest)
        .execute(&connection)
        .expect("Error adding new guest");

    insert_into(guests_group::table)
        .values(&new_guests_group)
        .execute(&connection)
        .expect("Error adding group");
}

#[tauri::command]
fn get_group_id_from_guest(tax_code: String) -> i32 {
    use schema::guests_group::dsl::*;
    use schema::guests_group::dsl::group_id;
    use schema::rents;

    let connection = establish_connection();


    let possible_group_ids = guests_group
        .filter(guest_tax_code.eq(tax_code))
        .select(group_id)
        .load::<i32>(&connection)
        .expect("Error finding group ids");

    return rents::table
        .filter(rents::group_id.eq_any(possible_group_ids))
        .filter(rents::paid.eq(false))
        .select(rents::group_id)
        .limit(1)
        .get_result(&connection)
        .expect("Error finding group id");
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_houses,
            how_many_houses,
            get_apartments,
            how_many_apartments,
            get_guests_in_apartment,
            add_guest,
            get_group_id_from_guest,
            add_rent,
            get_group_id_from_rent_in_apartment,
            get_apartment_rent,
            close_rent
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
