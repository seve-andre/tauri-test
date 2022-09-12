import React, { useEffect, useRef, useState } from "react"
import {
  DataGrid,
  GridRowModel,
  GridColumns,
  gridClasses,
  useGridApiContext,
  useGridSelector,
  gridPageSelector,
  gridPageCountSelector,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarProps,
} from "@mui/x-data-grid"
import Snackbar from "@mui/material/Snackbar"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Alert, { AlertProps } from "@mui/material/Alert"
import { alpha, styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Pagination from "@mui/material/Pagination"
import PaginationItem from "@mui/material/PaginationItem"
import Header from "../../layouts/header/Header"
import { useNavigate, useParams } from "react-router"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"
import ButtonGroup from "@mui/material/ButtonGroup"
import DialogContentText from "@mui/material/DialogContentText"
import TextField, { TextFieldProps } from "@mui/material/TextField"
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { invoke } from "@tauri-apps/api"
import { Guest } from "../../models/Guest"
import Stack from "@mui/material/Stack"
import { randomTraderName } from "@mui/x-data-grid-generator"
import CodiceFiscale from "codice-fiscale-js"
import { Rent } from "../../models/Rent"
import Chip from "@mui/material/Chip"

const ODD_OPACITY = 0.2

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[200],
    "&:hover, &.Mui-hovered": {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
    "&.Mui-selected": {
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity,
      ),
      "&:hover, &.Mui-hovered": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY +
            theme.palette.action.selectedOpacity +
            theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn"t add specificity
        "@media (hover: none)": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  },
}))

function computeMutation(newRow: GridRowModel, oldRow: GridRowModel) {
  if (newRow.tax_code !== oldRow.tax_code) {
    return `CF da "${oldRow.tax_code}" a "${newRow.tax_code}"`
  }
  if (newRow.first_name !== oldRow.first_name) {
    return `Nome da "${oldRow.first_name || ""}" a "${newRow.first_name || ""}"`
  }
  if (newRow.last_name !== oldRow.last_name) {
    return `Cognome da "${oldRow.last_name || ""}" a "${newRow.last_name || ""}"`
  }
  if (newRow.birthplace !== oldRow.birthplace) {
    return `Luogo di nascita da "${oldRow.birthplace || ""}" a "${newRow.birthplace || ""}"`
  }
  if (newRow.birth_date !== oldRow.birth_date) {
    return `Data di nascita da "${oldRow.birth_date || ""}" a "${newRow.birth_date || ""}"`
  }
  if (newRow.phone_number !== oldRow.phone_number) {
    return `Numero di telefono da "${oldRow.phone_number || ""}" a "${newRow.phone_number || ""}"`
  }
  return null
}


function CustomPagination() {
  const apiRef = useGridApiContext()
  const page = useGridSelector(apiRef, gridPageSelector)
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)

  return (
    <Pagination
      color="primary"
      variant="outlined"
      shape="rounded"
      page={page + 1}
      count={pageCount}
      // @ts-expect-error
      renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
      onChange={(_event: React.ChangeEvent<unknown>, value: number) =>
        apiRef.current.setPage(value - 1)
      }
    />
  )
}

const ExportToolbar = (props: GridToolbarProps) => {
  return (
    <GridToolbarContainer>
      <GridToolbarExport csvOptions={{ fileName: `ospiti-casa${props.idHouse}-appartamento${props.idApartment}` }} />
    </GridToolbarContainer>
  )
}

export default function Apartment() {
  const noButtonRef = React.useRef<HTMLButtonElement>(null)
  const [promiseArguments, setPromiseArguments] = useState<any>(null)

  const [snackbar, setSnackbar] = React.useState<Pick<
    AlertProps,
    "children" | "severity"
  > | null>(null)

  const handleCloseSnackbar = () => setSnackbar(null)

  const processRowUpdate = React.useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel) =>
      new Promise<GridRowModel>((resolve, reject) => {
        const mutation = computeMutation(newRow, oldRow)
        if (mutation) {
          // Save the arguments to resolve or reject the promise later
          setPromiseArguments({ resolve, reject, newRow, oldRow })
        } else {
          resolve(oldRow) // Nothing was changed
        }
      }),
    [],
  )

  const handleNo = () => {
    const { oldRow, resolve } = promiseArguments
    resolve(oldRow) // Resolve with the old row to not update the internal state
    setPromiseArguments(null)
  }

  const handleYes = async () => {
    const { newRow, oldRow, reject, resolve } = promiseArguments

    try {
      // Make the HTTP request to save in the backend
      setSnackbar({ children: "Ospite salvato correttamente", severity: "success" })
      setPromiseArguments(null)
    } catch (error) {
      setSnackbar({ children: "Il nome non può essere vuoto", severity: "error" })
      reject(oldRow)
      setPromiseArguments(null)
    }
  }

  const handleEntered = () => {
    // The `autoFocus` is not used because, if used, the same Enter that saves
    // the cell triggers "No". Instead, we manually focus the "No" button once
    // the dialog is fully open.
    // noButtonRef.current?.focus()
  }

  const renderConfirmDialog = () => {
    if (!promiseArguments) {
      return null
    }

    const { newRow, oldRow } = promiseArguments
    const mutation = computeMutation(newRow, oldRow)

    return (
      <Dialog
        maxWidth="xs"
        TransitionProps={{ onEntered: handleEntered }}
        open={!!promiseArguments}
      >
        <DialogTitle>Sei sicuro?</DialogTitle>
        <DialogContent dividers>
          {`Se premi "Sì" cambierà ${mutation}.`}
        </DialogContent>
        <DialogActions>
          <Button ref={noButtonRef} onClick={handleNo}>
            No
          </Button>
          <Button onClick={handleYes}>Sì</Button>
        </DialogActions>
      </Dialog>
    )
  }

  const [guests, setGuests] = useState<Guest[]>([])

  let params = useParams()
  let idHouse = params.idHouse
  let idApartment = params.idApartment

  const [localGroupId, setGroupId] = useState<number>()
  const [rent, setRent] = useState<Rent | null>(null)

  async function loadGuests() {
    const guests: Guest[] = await invoke('get_guests_in_apartment', { hName: idHouse, apartmentNum: Number(idApartment) })
    setGuests(guests)
  }

  async function loadRent() {
    const rent: Rent = await invoke("get_apartment_rent", { apartmentNum: Number(idApartment) })

    console.log(rent)
    setRent(rent)
    setStartDate(new Date(rent?.start_date))
    setEndDate(new Date(rent?.end_date))
  }

  useEffect(() => {
    loadRent()
    loadGuests()
  }, [])

  const [open, setOpen] = useState(false)

  const openNewPersonDialog = () => {
    setOpen(true)
  }

  const navigate = useNavigate()
  const closeApartment = () => {
    // set paid = true to rent
    invoke("close_rent", { apartmentNum: Number(idApartment) })

    // calculate final price
    let diff = Math.abs(endDate!.getTime() - startDate!.getTime())
    let diffDays = Math.ceil(diff / (1000 * 3600 * 24))
    let finalPrice = rent?.total_price! + guests.length * diffDays

    alert(`Il prezzo finale per l'appartamento ${idApartment} è ${finalPrice} €`)

    // go back to home
    navigate("/")
  }

  const closeNewPersonDialog = () => setOpen(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [birthplace, setBirthplace] = useState("")
  const [docNumber, setDocNumber] = useState("")
  const [district, setDistrict] = useState("")
  const [cityResidence, setCityResidence] = useState("")
  const [nationality, setNationality] = useState("")


  const addNewPerson = async() => {
    if (
      firstName.length !== 0
      && lastName.length !== 0
    ) {
      let birthDateFormatted = `${birthDate?.getFullYear()}-${("0" + (birthDate?.getMonth()! + 1)).slice(-2)}-${("0" + birthDate?.getDate()).slice(-2)}`
      const fullCF = new CodiceFiscale({
        name: firstName,
        surname: lastName,
        gender: gender === "M" ? "M" : "F",
        day: birthDate?.getDate()!,
        month: birthDate?.getMonth()! + 1,
        year: birthDate?.getFullYear()!,
        birthplace: birthplace,
        birthplaceProvincia: district
      })

      setGuests(prevGuests => [
          createNewGuest(fullCF.cf, firstName, lastName, birthplace, birthDateFormatted, phoneNumber),
          ...prevGuests!
        ]
      )
      setOpen(false)

      // if one guest is already in the group, get the id of the group and use it to add him too
      if (guests.length !== 0) {
        invoke("add_guest", {
          groupId: 1,
          guestTaxCode: fullCF.cf,
          guestFirstName: firstName,
          guestLastName: lastName,
          guestBirthplace: birthplace,
          guestBirthDate: birthDateFormatted
        })
      } else {
        // if no group, create one and add the guest
        /* await invoke("get_group_id_from_rent_in_apartment", {
          apartmentNum: Number(idApartment)
        }).then(id => setGroupId(id as number)) */

        invoke("add_guest", {
          groupId: 1,
          guestTaxCode: fullCF.cf,
          guestFirstName: firstName,
          guestLastName: lastName,
          guestBirthplace: birthplace,
          guestBirthDate: birthDateFormatted
        })
      }
    }
  }

  const [docType, setDocType] = useState("")
  const changeDocType = (event: SelectChangeEvent) => {
    setDocType(event.target.value)
  }

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const [birthDate, setBirthDate] = useState<Date>()

  const [pageState, setPageState] = useState("choose-period")

  const [gender, setGender] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const now = new Date()

  return pageState === "choose-period" && guests.length === 0 ? (
        <div>
            <Header />
            <div style={{height: "100%", display: "flex", alignItems: "center", flexDirection: "column", gap: 15}}>
                <Typography variant="h1" component="div" fontWeight={"bold"} fontSize={30} textAlign={"center"}>
                    Periodi comuni
                </Typography>
                <ButtonGroup size="large" variant="contained" aria-label="outlined primary button group">
                    <Button style={{height: "60px"}} onClick={() => {
                        setPageState("table")
                        setStartDate(now)
                        setEndDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7))
                        // should make a rent for the n. of days

                        console.log(`${startDate?.getFullYear()}-${("0" + (startDate?.getMonth()! + 1)).slice(-2)}-${("0" + startDate?.getDate()).slice(-2)}`)
                        console.log(`${endDate?.getFullYear()}-${("0" + (endDate?.getMonth()! + 1)).slice(-2)}-${("0" + endDate?.getDate()).slice(-2)}`)

                        invoke("add_rent", {
                          start: "2022-09-12",
                          end: "2022-09-19",
                          hName: idHouse,
                          apartmentNum: Number(idApartment)
                        })
                      }}>
                        1<br />settimana
                    </Button>
                    <Button style={{height: "60px"}} onClick={() => {
                        setPageState("table")
                        setStartDate(now)
                        setEndDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15))
                        invoke("add_rent", {
                          start: "2022-09-12",
                          end: "2022-09-27",
                          hName: idHouse,
                          apartmentNum: Number(idApartment)
                        })
                      }}>
                        15<br />giorni
                    </Button>
                    <Button style={{height: "60px"}} onClick={() => {
                        setPageState("table")
                        setStartDate(now)
                        setEndDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30))
                        invoke("add_rent", {
                          start: "2022-09-12",
                          end: "2022-10-12",
                          hName: idHouse,
                          apartmentNum: Number(idApartment)
                        })
                      }}>
                        1<br />mese
                    </Button>
                </ButtonGroup>
                <Tooltip title={`apri appartmento n. ${idApartment}, aggiungendo il periodo di permanenza`}>
                    <Button color="primary" onClick={() => setPageState("custom")}>aggiungi altro periodo</Button>
                </Tooltip>
            </div>
        </div>
      ) : pageState === "custom" ? (
        <div>
          <Box
            component="form"
            // noValidate
            autoComplete="on"
            display={"flex"}
            flexDirection={"column"}
            gap={4}
            margin={5}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="Data di arrivo"
                inputFormat="dd/MM/yyyy"
                value={startDate}
                onChange={(newDate) => setStartDate(newDate !== null ? newDate : undefined)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="Data di partenza"
                inputFormat="dd/MM/yyyy"
                value={endDate}
                onChange={(newDate) => setEndDate(newDate !== null ? newDate : undefined)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>

            <Tooltip title="avanza">
              <Button variant="contained" onClick={() => {
                setPageState("table")
                console.log(startDate, endDate)
              }} style={{backgroundColor: "#21b6ae", fontWeight: "700"}} sx={{px: 5, py: 1}}>avanti</Button>
            </Tooltip>
          </Box>
        </div>
      ) : (
        <div>
            <Header />
            <Typography variant="h1" component="div" sx={{my: 5}} fontWeight={"bold"} fontSize={30} textAlign={"center"}>
                Casa n. {idHouse} - Appartamento n. {idApartment}
            </Typography>
            <Typography variant="h1" component="div" sx={{my: 5}} fontWeight={"bold"} fontSize={30} textAlign={"center"}>
                Periodo: dal {("0" + startDate?.getDate()).slice(-2)}-{("0" + (startDate?.getMonth()! + 1)).slice(-2)} al {("0" + endDate?.getDate()).slice(-2)}-{("0" + (endDate?.getMonth()! + 1)).slice(-2)}
            </Typography>
            {/* center table in the screen */}
            <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                <Box
                  sx={{
                      height: 400,
                      width: "95%",
                      mx: 5,
                      "& .MuiDataGrid-columnHeader": {
                        align: "left"
                      },
                      "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: 700
                      },
                      "& .MuiDataGrid-menuIconButton": {
                        visibility: "hidden"
                      },
                      "& .MuiPaginationItem-root": {
                        borderRadius: 1,
                      },
                      "& .MuiDataGrid-selectedRowCount": {
                        visibility: "hidden"
                      }
                  }}
                >
                {renderConfirmDialog()}
                <StripedDataGrid
                    rows={guests!}
                    columns={guests_columns}
                    processRowUpdate={processRowUpdate}
                    experimentalFeatures={{ newEditingApi: true }}
                    getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                    }
                    getRowId={row => row.tax_code}
                    pageSize={5}
                    // rowsPerPageOptions={[5]}
                    components={{
                      Pagination: CustomPagination,
                      Toolbar: ExportToolbar,
                      NoRowsOverlay: () => (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                          Nessun ospite
                        </Stack>
                      )
                    }}
                    componentsProps={{ toolbar: {idHouse, idApartment} }}
                />
                <Tooltip title="aggiungi un nuovo ospite">
                    <Button variant="contained" onClick={openNewPersonDialog} style={{backgroundColor: "#21b6ae", fontWeight: "700"}} sx={{px: 5, py: 1}}>aggiungi ospite</Button>
                </Tooltip>
                <Tooltip title="chiudi appartamento">
                    <Button variant="contained" onClick={closeApartment} style={{backgroundColor: "#21b6ae", fontWeight: "700"}} sx={{px: 5, py: 1}}>chiudi appartmento</Button>
                </Tooltip>
                <Dialog open={open} onClose={closeNewPersonDialog} scroll={"paper"}>
                  <DialogTitle fontWeight={"bold"}>Nuovo ospite</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        Aggiungi un nuovo ospite all'appartamento {idApartment}. È necessario disporre un documento di riconoscimento.
                      </DialogContentText>
                      <div>
                        <Typography variant="h1" component="div" sx={{my: 2}} fontSize={18}>
                            Dati persona
                        </Typography>
                        <Box
                          component="form"
                          // noValidate
                          autoComplete="on"
                          display={"flex"}
                          flexDirection={"column"}
                          gap={4}
                        >
                          <TextField
                            autoFocus
                            required
                            label="Nome"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                          />
                          <TextField
                            required
                            label="Cognome"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                          />
                          <TextField
                            required
                            label="Luogo di nascita"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={birthplace}
                            onChange={(event) => setBirthplace(event.target.value)}
                          />
                          <TextField
                            label="Numero di telefono"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                          />
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DesktopDatePicker
                              label="Data di nascita *"
                              inputFormat="dd/MM/yyyy"
                              value={birthDate}
                              onChange={(newDate) => setBirthDate(newDate !== null ? newDate : undefined)}
                              renderInput={(params) => <TextField {...params} />}
                            />
                          </LocalizationProvider>
                          <Typography variant="h1" component="div" fontWeight={"bold"} fontSize={15}>
                            Sesso
                          </Typography>
                          <FormControl variant="standard" sx={{ minWidth: 80 }}>
                            <InputLabel id="demo-simple-select-standard-label">Sesso *</InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              value={gender}
                              onChange={(event) => setGender(event.target.value)}
                              autoWidth
                              label="Sesso"
                            >
                              <MenuItem value={"M"}>M</MenuItem>
                              <MenuItem value={"F"}>F</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <Typography variant="h1" component="div" sx={{my: 2}} fontSize={18}>
                          Dati documento
                        </Typography>
                        <Box
                          component="form"
                          // noValidate
                          autoComplete="on"
                          display={"flex"}
                          flexDirection={"column"}
                          gap={4}
                        >
                          <FormControl variant="standard" sx={{ minWidth: 80 }}>
                            <InputLabel id="demo-simple-select-standard-label">Tipo documento *</InputLabel>
                            <Select
                              labelId="demo-simple-select-standard-label"
                              id="demo-simple-select-standard"
                              value={docType}
                              onChange={changeDocType}
                              autoWidth
                              label="Tipo documento"
                            >
                              <MenuItem value={"Carta d'identità"}>Carta d'identità</MenuItem>
                              <MenuItem value={"Passaporto"}>Passaporto</MenuItem>
                              <MenuItem value={"Patente"}>Patente</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            required
                            label="Numero documento"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={docNumber}
                            onChange={(event) => setDocNumber(event.target.value)}
                          />
                          <TextField
                            required
                            label="Provincia"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={district}
                            onChange={(event) => setDistrict(event.target.value)}
                          />
                          <TextField
                            required
                            label="Residenza"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={cityResidence}
                            onChange={(event) => setCityResidence(event.target.value)}
                          />
                          <TextField
                            required
                            label="Nazionalità"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={nationality}
                            onChange={(event) => setNationality(event.target.value)}
                          />
                        </Box>
                      </div>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={closeNewPersonDialog}>Annulla</Button>
                    <Button onClick={() => addNewPerson()} variant="contained">Aggiungi</Button>
                  </DialogActions>
                </Dialog>
                {!!snackbar && (
                    <Snackbar open onClose={handleCloseSnackbar} autoHideDuration={4000}>
                    <Alert {...snackbar} onClose={handleCloseSnackbar} />
                    </Snackbar>
                )}
                </Box>
            </div>
        </div>
    )
}

const guests_columns: GridColumns = [
  {
    field: "tax_code",
    headerName: "CF",
    width: 200,
    editable: true
  },
  {
    field: "first_name",
    headerName: "Nome",
    width: 200,
    editable: true
  },
  {
    field: "last_name",
    headerName: "Cognome",
    width: 180,
    editable: true
  },
  {
    field: "birthplace",
    headerName: "Luogo nascita",
    width: 220,
    editable: true
  },
  {
    field: "birth_date",
    headerName: "Data di nascita",
    type: "date",
    width: 220,
    editable: true
  },
  {
    field: "phone_number",
    headerName: "Numero di telefono",
    width: 220,
  }
]

const createNewGuest = (
  taxCode: String,
  firstName: String,
  lastName: String,
  birthplace: String,
  birth_date: String,
  phone_number?: String
) => {
  return {
    tax_code: taxCode,
    first_name: firstName,
    last_name: lastName,
    birthplace: birthplace,
    birth_date: birth_date,
    phone_number: phone_number
  }
}
