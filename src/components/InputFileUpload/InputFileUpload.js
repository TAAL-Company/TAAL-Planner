import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function InputFileUpload(props) {
    return (
        <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            onChange={(e) => props.setPicture(e.target.files[0])}
            //   startIcon={}
            style={{
                textAlign: 'right',
                // width: '0%',
                height: '38px',
                direction: props.language === 'English' ? 'rtl' : 'ltr',
            }}
        >
            {props.language !== 'English' ?
                <>
                    Upload from computer .<CloudUploadIcon />
                </>
                :
                <>
                  <CloudUploadIcon />.  העלה מהמחשב 
                </>

            }
            <VisuallyHiddenInput type="file" />
        </Button>
    );
}
