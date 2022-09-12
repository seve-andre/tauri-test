import React, { useEffect, useState } from 'react'
import { Box, Button, Grid, styled, Tooltip, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { invoke } from '@tauri-apps/api/tauri'

function ChooseHouse() {
    const [howManyHouses, setHowManyHouses] = useState<number | null>(null)

    async function loadHouses() {
        const housesNumber: number = await invoke("how_many_houses")
        setHowManyHouses(housesNumber)
    }

    useEffect(() => {
        loadHouses()
    }, [])

    return (
        <Box height={"100vh"} display={"flex"} flexDirection={"column"}>
            <Typography variant="h1" component="div" sx={{my: 5}} fontWeight={"bold"} fontSize={30} textAlign={"center"}>
                Le Casine
            </Typography>
            <Box sx={{flexGrow: 2}}>
                <Grid container spacing={1} sx={{width: "100%"}}>
                    {
                        [...Array(howManyHouses)].map((_house, i) =>
                            <Grid item xs={4} sx={{display: "flex", justifyContent: "center"}}>
                                <Tooltip title={`vai a casa ${i+1}`}>
                                    <Button component={Link} to={`/choose-apartment/${i+1}`} variant="contained" style={{backgroundColor: "#21b6ae", fontWeight: "700"}}
                                        sx={{px: 5, py: 1}}>
                                            casa {i+1}
                                    </Button>
                                </Tooltip>
                            </Grid>
                        )
                    }
                </Grid>
            </Box>
            <footer style={{display: "flex", justifyContent: "space-between", alignItems: "center", bottom: 0, height: "10%", paddingLeft: 10, paddingRight: 10}}>
                {/* <Link to="/">Tassa di soggiorno</Link> */}
                <Link to="/prices">Prezzi</Link>
            </footer>
        </Box>
    )
}

export default ChooseHouse