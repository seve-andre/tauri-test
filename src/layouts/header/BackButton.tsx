import React from "react";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Link, useNavigate } from "react-router-dom";


function BackButton() {
    let navigate = useNavigate();

    return (
        <Tooltip title="torna indietro">
            <IconButton onClick={() => navigate(-1)} aria-label="go back">
                <ChevronLeftIcon className="icon" style={{height: "40px", width: "40px"}} />
            </IconButton>
        </Tooltip>
    );
}

export default BackButton;