import React, { useState, useReducer, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

let btnBack = [
    {
        id: 1,
        back: 'Back'
    }
];


const type = [
    { id: 1, title: "Raw Material", value: 'Raw Material' },
    { id: 2, title: "Finished Goods", value: 'Finished Goods' },
    { id: 3, title: "Semi-Finished Goods", value: 'Semi-Finished Goods' },
    { id: 4, title: "Stationary Goods", value: 'Stationary Goods' },
];

const initialState = {
    isSubmitted: false,
    isLoading: false,
    error: null,
};

const formReducer = (state, action) => {
    switch (action.type) {
        case 'SUBMIT_FORM':
            return { ...state, isLoading: true };
        case 'SUBMIT_SUCCESS':
            return { ...state, isSubmitted: true, isLoading: false };
        case 'SUBMIT_ERROR':
            return { ...state, isSubmitted: false, isLoading: false, error: action.payload };
        default:
            return state;
    }
};

function RawMaterialForm(props) {
    const { setRawMaterialPages, materialFormData ,ipAddress} = props;
    console.log(`materialFormData in form page : ${JSON.stringify(materialFormData)}`)
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [loading, setLoading] = useState(false);

    const [rawmaterialId, setRawMaterialId] = useState('');
    const [rawmaterialName, setRawMaterialName] = useState('');
    const [rawmaterialBarcode, setRawMaterialBarcode] = useState('');
    const [materialCategory, setMaterialCategory] = useState('');
    const [types, setTypes] = useState('');
    const [formValues, setFormValues] = useState('');
    const [packageDetails, setPackageDetails] = useState('');
    const [description, setDescription] = useState('');
    const [validationErrors, setValidationErrors] = useState({
        rawMaterialId: '',
        rawMaterialName: '',
        materialCategory: '',
        rawMaterialBarcode: '',
        types: '',
    });
    const [categoryOptions, setCategoryOptions] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://${ipAddress}/rawmaterial/categoty`);
                setCategoryOptions(response.data.data);
            } catch (error) {
                console.error('Error fetching material data:', error);
            }
        };

        fetchData();
    }, []); // Run once on component mount



    const handleInputChange = (e, newValue) => {
        const inputValue = newValue;
        setMaterialCategory(inputValue);
    };

    const validateForm = () => {
        let isValid = true;
        const errors = {
            rawMaterialId: '',
            rawMaterialName: '',
            materialCategory: '',
            rawMaterialBarcode: '',
            types: '',
        };

        if (!rawmaterialId) {
            isValid = false;
            errors.rawMaterialId = 'Material ID is required';
        }

        if (!rawmaterialName) {
            isValid = false;
            errors.rawMaterialName = 'Material Name is required';
        }

        if (!materialCategory) {
            isValid = false;
            errors.materialCategory = 'Category is required';
        }

        if (!rawmaterialBarcode) {
            isValid = false;
            errors.rawMaterialBarcode = 'Barcode Number is required';
        }

        if (!types) {
            isValid = false;
            errors.types = 'Material Type is required';
        }

        setValidationErrors(errors);

        return isValid;
    };

    const handelRawMaterialFormSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: 'SUBMIT_FORM' });

        if (validateForm()) {
            const rawMaterialFormData = {
                rawmaterialId,
                rawmaterialName,
                materialCategory,
                rawmaterialBarcode,
                types,
                formValues,
                packageDetails,
                description,
            };

            setLoading(true);

            try {
                // Check if material name or barcode already exists
                const existingMaterials = materialFormData.map((material) => ({
                    name: material.material_name,
                    id: material.material_id,
                    barcode: material.barcode_no,
                }));

                const duplicateName = existingMaterials.find((material) => material.name === rawmaterialName);
                const duplicateId = existingMaterials.find((material) => material.id === rawmaterialId);
                const duplicateBarcode = existingMaterials.find((material) => material.barcode === rawmaterialBarcode);

                if (duplicateName || duplicateId || duplicateBarcode) {
                    setLoading(false);

                    const errorMessages = [];
                    if (duplicateName) {
                        errorMessages.push(`Material name '${rawmaterialName}' already exists.`);
                    }
                    if (duplicateId) {
                        errorMessages.push(`Material ID '${rawmaterialId}' already exists.`);
                    }
                    if (duplicateBarcode) {
                        errorMessages.push(`Barcode number '${rawmaterialBarcode}' already exists.`);
                    }

                    dispatch({
                        type: 'SUBMIT_ERROR',
                        payload: errorMessages.join(' '),
                    });
                } else {
                    // Proceed with form submission
                    const response = await axios.post(`http://${ipAddress}/rawMaterialForm`, rawMaterialFormData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    console.log(response);
                    setLoading(false);
                    dispatch({ type: 'SUBMIT_SUCCESS' });

                    setTimeout(() => {
                        setRawMaterialPages(0);
                        window.location.reload();
                    }, 1500);
                }
            } catch (error) {
                console.log(error);
                dispatch({ type: 'SUBMIT_ERROR', payload: 'Submission failed.' });
            }
        }
    };

    // console.log(`categoryOptions : ${JSON.stringify(categoryOptions)}`)

    return (
        <div className='raw-material-form-container'>
            <div className="raw-material-add-div">
                <h1>Raw Material Form</h1>
                {btnBack.map((item) => (
                    <Button variant="contained" key={item.id} onClick={() => setRawMaterialPages(0)}>
                        {item.back}
                    </Button>
                ))}
            </div>
            <div className='raw-material-form-div'>
                <form action="">
                    <TextField
                        required
                        label="Add Material Id"
                        id="materialId"
                        onChange={(e) => setRawMaterialId(e.target.value)}
                        error={!!validationErrors.rawMaterialId}
                        helperText={validationErrors.rawMaterialId}
                        sx={{
                            '& > :not(style)': { m: 1, width: 480 },
                        }}
                    />
                    <TextField
                        required
                        label="Add Material Name"
                        id="materialId"
                        onChange={(e) => setRawMaterialName(e.target.value)}
                        error={!!validationErrors.rawMaterialName}
                        helperText={validationErrors.rawMaterialName}
                        sx={{
                            '& > :not(style)': { m: 1, width: 480 },
                        }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <Autocomplete
                            disablePortal
                            filterSelectedOptions
                            onChange={(e, newValue) => setTypes(newValue)}
                            id="combo-box-demo"
                            options={type.map((option) => option.title)}
                            sx={{ width: 320 }}
                            renderInput={(params) => <TextField {...params} label="Material Type" placeholder='Material Name' />}
                            error={!!validationErrors.types}
                            helperText={validationErrors.types}
                        />
                        <Autocomplete
                            id="free-solo-demo"
                            freeSolo
                            options={Array.from(new Set(categoryOptions.map((option) => option.category)))}
                            onInputChange={handleInputChange}
                            sx={{
                                '& > :not(style)': { m: 1, width: 320 },
                            }}
                            renderInput={(params) => <TextField {...params} label="Category" />}
                            error={!!validationErrors.materialCategory}
                            helperText={validationErrors.materialCategory}
                        />
                        <TextField
                            label="Barcode Number"
                            required
                            id="materialId"
                            onChange={(e) => setRawMaterialBarcode(e.target.value)}
                            error={!!validationErrors.rawMaterialBarcode}
                            helperText={validationErrors.rawMaterialBarcode}
                            sx={{
                                '& > :not(style)': { m: 1, width: 320 },
                            }}
                        />
                    </span>
                    <span>
                        <TextField
                            label="Values"
                            id="materialId"
                            onChange={(e) => setFormValues(e.target.value)}
                            sx={{
                                '& > :not(style)': { m: 2, width: 230 },
                            }}
                        />
                        <TextField
                            label="Package"
                            id="materialId"
                            onChange={(e) => setPackageDetails(e.target.value)}
                            sx={{
                                '& > :not(style)': { m: 2, width: 230 },
                            }}
                        />
                        <TextField
                            label="Description"
                            id="materialId"
                            multiline
                            onChange={(e) => setDescription(e.target.value)}
                            sx={{
                                '& > :not(style)': { m: 2, width: 450 },
                            }}
                        />
                    </span>
                </form>
                <div className='error'>
                    {state.isSubmitted ? (
                        <div>Form submitted successfully!</div>
                    ) : (
                        <div style={{ color: 'red' }}>{state.error || ''}</div>
                    )}

                    
                </div>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    margin: '40px 0px',
                }}>
                    <Button variant="contained" style={{ width: '20%' }} onClick={() => setRawMaterialPages(0)}>
                        Cancel
                    </Button>
                    <Button variant="contained" type='submit' style={{ width: '20%' }} onClick={handelRawMaterialFormSubmit}>
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default RawMaterialForm;
