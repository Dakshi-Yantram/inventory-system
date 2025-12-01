import React, { useState, useEffect, useReducer } from "react";
import "./request.css";
import Button from "@mui/material/Button";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';



let btnBack = [
  {
    id: 1,
    title: 'Back'
  }
]
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


function RequestForm(props) {
  const { setRequestPage, ipAddress } = props;
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [loading, setLoading] = useState(false)

  const [requestDate, setRequestDate] = useState();
  const [requestedBy, setRequestedBy] = useState([]);
  const [empData, setEmpData] = useState([]);
  //new
  const [receivedDate, setReceivedDate] = useState("");
  const [employeeID, setEmployeeID] = useState("");
  const [materialInputs, setMaterialInputs] = useState([{ name: "", qty: "" }]);

  const navigate = useNavigate()

  const handleMaterialInputChange = (index, key, value) => {
    const updatedMaterialInputs = [...materialInputs];
    updatedMaterialInputs[index][key] = value;
    console.log(updatedMaterialInputs);
    setMaterialInputs(updatedMaterialInputs);
  };
  const addMaterialField = () => {
    setMaterialInputs([...materialInputs, { name: "", qty: "" }]);
  };

  // const [requestMaterialName, setRequestMaterialName] = useState()
  // const [requestQty, seRequestQty] = useState(0)

  const handleDateChangeRequestDate = (date) => {
    if (date) {
      const formatted = date.format("YYYY-MM-DD");
      setRequestDate(formatted);
    } else {
      setRequestDate("");
    }
  };
  const handleInputChange = (e, newValue) => {
    // Get the current input value
    const inputValue = newValue;
    setRequestedBy(inputValue);
  };


  useEffect(() => {
    employeeData();
  }, []);

  async function employeeData() {
    try {
      const response = await axios.get(`http://${ipAddress}/employee`);
      // Assuming the server is running on the same host
      setEmpData(response.data.data);
      // console.log(response.data)
    } catch (error) {
      console.error("Error:", error);
    }
  }
  // console.log(empData)

  const [materialFormData, setMaterialFormData] = useState([]);

  useEffect(() => {
    getMaterialID();
  }, []);

  //g
  async function getMaterialID() {
    try {
      const response = await axios.get(
        `http://${ipAddress}/rawmaterial/data`
      );
      // Assuming the server is running on the same host
      setMaterialFormData(response.data.data);
      // console.log(response.data.data)
      // console.log('materialFormData' + materialFormData)
    } catch (error) {
      console.error("Error:", error);
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if required fields are empty
    if (!requestDate) {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Please select a Request Date.' });
      return;
    }

    if (!requestedBy) {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Please select a Requested By name.' });
      return;
    }

    for (const material of materialInputs) {
      if (!material.name.trim() || !material.qty.trim()) {
        dispatch({ type: 'SUBMIT_ERROR', payload: 'Material Name and Quantity cannot be empty.' });
        return;
      }
    }

    dispatch({ type: 'SUBMIT_FORM' });

    // Send a POST request to your backend API to save the data
    const requestData = { requestDate, requestedBy, materialInputs };
    setLoading(true);

    try {
      const response = await axios.post(`http://${ipAddress}/api/material-request`, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(response); // Access response data
      setLoading(false);
      dispatch({ type: 'SUBMIT_SUCCESS' });

      setTimeout(() => {
        setRequestPage(0)
        window.location.reload();
      }, 1000);
    } catch (error) {
      setLoading(false);
      dispatch({ type: 'SUBMIT_ERROR', payload: 'Submission failed.' });
      console.log("Error:", error);
    };
  };


  const addMaterialInput = () => {
    if (materialInputs.length < 10) {
      setMaterialInputs([...materialInputs, { name: "", qty: "" }]);
    }
  };

  // console.log(materialInputs)
  return (
    <div className="request-form-container">
      <div className="raw-material-add-div">
        <h1>Request Form</h1>
        {btnBack.map((item) => {
          return <Button variant="contained" className='add-vendor' key={item.id} onClick={() => setRequestPage(0)}>{item.title}</Button>
        })}
      </div>
      <div className="request-form-division">
        <form action="" onSubmit={handleSubmit}>
          <span>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Request Date"
                required
                value={requestDate}
                onChange={handleDateChangeRequestDate}
                format="DD-MM-YYYY"
                sx={{
                  "& > :not(style)": { m: 1, width: 250 },
                }}
              />
            </LocalizationProvider>
            <Autocomplete
              disablePortal
              required
              filterSelectedOptions
              id="combo-box-demo"
              // options={empData}
              options={empData.map((option) => option.EmployeeName)}
              onChange={handleInputChange}
              sx={{ width: 250 }}
              renderInput={(params) => (
                <TextField {...params} label="Requested By" />
              )}
            />
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            {materialInputs.map((material, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Autocomplete
                  disablePortal
                  required
                  filterSelectedOptions
                  id="combo-box-demo"
                  value={material.name}
                  // options={top100Films}
                  options={materialFormData.map(
                    (option) => option.material_name
                  )}
                  onChange={(e, newValue) =>
                    handleMaterialInputChange(index, "name", newValue)
                  }
                  sx={{ width: 250 }}
                  renderInput={(params) => (
                    <TextField {...params} label="Material Name" />
                  )}
                />
                <TextField
                  label="Quantity"
                  id="Quantity"
                  // value={requestQty}
                  placeholder="Material Qty"
                  value={material.qty}
                  required
                  onChange={(e) =>
                    handleMaterialInputChange(index, "qty", e.target.value)
                  }
                  sx={{
                    "& > :not(style)": { m: 1, width: 250 },
                  }}
                />
              </div>
            ))}

            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-around",
                margin: '20px'
              }}
            >
              {materialInputs.length < 10 && (
                <Button variant="contained" onClick={addMaterialField}>
                  Add More
                </Button>
              )}
              <div style={{
                width: '50%',
                display: 'flex',
                justifyContent: 'space-around'
              }}>

                <Button variant="contained" className='add-vendor' onClick={() => setRequestPage(0)}>Cancel</Button>

                <Button variant="contained" type='submit' style={{
                  width: '20%'
                }}>Submit</Button>
              </div>
            </div>
            <div>
              {materialInputs.length >= 10 && (
                <p>You cannot add more than 10 materials.</p>
              )}
            </div>
            <div className='error'>
              {state.isSubmitted ? (
                <div>Form submitted successfully!</div>
              ) : (
                <div>{state.error || ''}</div>
              )}
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestForm;
