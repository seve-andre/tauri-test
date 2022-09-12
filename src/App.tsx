import React from "react"
import "./assets/styles/base.scss"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Apartment from "./pages/apartment/Apartment"
import ChooseApartment from "./pages/choose/ChooseApartment"
import ChooseHouse from "./pages/choose/ChooseHouse"
import PricesTable from "./pages/prices/PricesTable"

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChooseHouse />} /> {/* first page to be shown */}
          <Route path="/choose-apartment/:idHouse" element={<ChooseApartment />} />
          <Route path="/apartment/:idHouse/:idApartment" element={<Apartment />} />
          <Route path="/prices" element={<PricesTable />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App
