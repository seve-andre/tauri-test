import React from "react"
import IconButton from "@mui/material/IconButton"
import { Tooltip } from "@mui/material"
import { Link } from "react-router-dom"

function LogoButton() {
    return (
        <Tooltip title="torna alla home">
            <IconButton component={Link} to="/">
                <img src={require("../../assets/images/logo89x89.png")} alt="Logo applicazione" />
            </IconButton>
        </Tooltip>
    )
}

export default LogoButton