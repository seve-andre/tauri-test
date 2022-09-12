import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Toolbar } from "@mui/material";
import { invoke } from "@tauri-apps/api/tauri";
import { House } from "../../models/House";
import { useEffect, useState } from "react";
import { Apartment } from "../../models/Apartment";
import Header from "../../layouts/header/Header";

export default function PricesTable() {
  const [houses, setHouses] = useState<House[]>()
  const [apartments, setApartments] = useState<Apartment[]>()


  async function loadHouses() {
    let houses: House[] = await invoke("get_houses")
    setHouses(houses)
  }

  async function loadApartments() {
    let apartments: Apartment[] = await invoke("get_apartments", {hId: 1})
    setApartments(apartments)

    console.log(apartments)
  }

  useEffect(() => {
    loadHouses()
    loadApartments()
  }, [])

  return (
    <div>
      <Header />
      <TableContainer component={Paper}>
        {houses?.map((house) =>
          <div>
            <Typography variant="h1" component="div" sx={{my: 5}} fontWeight={"bold"} fontSize={30} textAlign={"center"}>
                Casa {house.house_name} - {house.street_type} {house.street_name} {house.street_number}
            </Typography>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Apartment number</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apartments?.map((apartment) => (
                  <TableRow
                    key={apartment.apartment_number}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {apartment.apartment_number}
                    </TableCell>
                    <TableCell align="right">{apartment.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TableContainer>
    </div>
  );
}
