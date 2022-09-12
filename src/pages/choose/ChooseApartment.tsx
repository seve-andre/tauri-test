import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../layouts/header/Header';
import { invoke } from '@tauri-apps/api';

function ChooseApartment() {
    let params = useParams()
    let idHouse = params.idHouse

    const [apartments, setApartments] = useState<number | null>(null)

    async function loadApartments() {
        const apartments: number = await invoke('how_many_apartments', { hName: Number(idHouse) })
        setApartments(apartments)
    }

    useEffect(() => {
        loadApartments()
    }, [])

    let size = apartments

    const navigate = useNavigate()
    useEffect(() => {
        if (size === 1) {
            setTimeout(() => {
                navigate("/apartment/1")
            }, 2000)
        }
    }, [])

    return size === 1
    ? (
        <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Typography variant="h1" component="div" fontSize={30}>
                Ti sto reindirizzando all'unico appartmento disponibile...
            </Typography>
        </div>
    )
    : (
        <div>
            <Header />
            <Typography variant="h1" component="div" sx={{my: 5}} fontWeight={"bold"} fontSize={30} textAlign={"center"}>
                Casa n. {idHouse}
            </Typography>
            <Box sx={{flexGrow: 1}}>
                {/* default number of columns: 12 */}
                <Grid container spacing={1} sx={{width: "100%"}}>
                    {[...Array(apartments)].map((_apartment, i) =>
                            <Grid item xs={size === 2 ? 6 : 4} sx={{display: "flex", justifyContent: "center"}}>
                                <Tooltip title={`vai ad appartmento ${i+1}`}>
                                    <Button component={Link} to={`/apartment/${idHouse}/${i+1}`} variant="contained" style={{backgroundColor: "#21b6ae", fontWeight: "700"}}
                                        sx={{px: 5, py: 1}}>
                                            appartamento {i+1}
                                    </Button>
                                </Tooltip>
                            </Grid>
                        )
                    }
                </Grid>
            </Box>
        </div>
    );
}

export default ChooseApartment;