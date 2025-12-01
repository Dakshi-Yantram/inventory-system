import React, { useEffect, useState, useReducer } from 'react'
import './Vendor.css'
import Button from '@mui/material/Button';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import axios from 'axios';


let btnBack = [
  {
    id: 0,
    back: 'Back'
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


function VendorForm(props) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { setVendorPage, ipAddress } = props
  const navigate = useNavigate();
  console.log(`setVendorPage :${JSON.stringify(setVendorPage)}`)

  const [vendorId, setVendorId] = useState(0)
  const [nameOfSupplier, setNameOfSupplier] = useState('');
  const [formDate, setFormDate] = useState(null);
  const [formOfficeAddress, setFormOfficeAddress] = useState('');
  const [formOfficeContactPerson, setFormOfficeContactPerson] = useState('');
  const [formOfficeDesignation, setFormOfficeDesignation] = useState('');
  const [formOfficeTelephone, setFormOfficeTelephone] = useState('');
  const [formOfficeFax, setFormOfficeFax] = useState('');
  const [formOfficeEmail, setFormOfficeEmail] = useState('');
  const [formWorkAddress, setFormWorkAddress] = useState('');

  const [formWorkContactPerson, setFormWorkContactPerson] = useState('');
  const [formWorkDesignation, setFormWorkDesignation] = useState('');
  const [formWorkTelephone, setFormWorkTelephone] = useState('');
  const [formWorkFax, setFormWorkFax] = useState('');
  const [formWorkEmail, setFormWorkEmail] = useState('');

  const [formBussiness, setFormBussiness] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formIsoCertified, setFormIsoCertified] = useState('');
  const [formRelevantField, setFormRelevantField] = useState('');
  const [formMajorClient, setFormMajorClient] = useState('');
  const [formOrderDate, setFormOrderDate] = useState('');
  const [formLeadTime, setFormLeadTime] = useState('');


  const [selectedValuesBussiness, setSelectedValuesBussiness] = useState([]);
  const [selectedValuesIso, setSelectedValuesIso] = useState([]);

  const [loading, setLoading] = useState(false)
  const [errorValidation, setErrorValidation] = useState('')



  useEffect(() => {
    if (document.querySelector('.error').innerText == "Please enter complete form") {
      document.querySelector('.error').style.color = 'red'
    } else if (document.querySelector('.error').innerText == "Data submited") {
      document.querySelector('.error').style.color = 'green'
    }
  })

  const handelOnchangeDate = (val) => {
    const date = new Date(val);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 to month since it's 0-based
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    setFormDate(formattedDate)
    // console.log(formattedDate)


  }

  const handelOnChangeTrail = (val) => {
    const date = new Date(val);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 to month since it's 0-based
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate2 = `${year}-${month}-${day}`;
    setFormOrderDate(formattedDate2)
    // console.log(formattedDate2)


  }

  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    if (event.target.checked) {
      // Add the value to the selected values
      setSelectedValuesBussiness([...selectedValuesBussiness, value]);
    } else {
      // Remove the value from the selected values
      setSelectedValuesBussiness(selectedValuesBussiness.filter((item) => item !== value));
    }
  };
  const handleIsoCheckChange = (event) => {
    const values = event.target.value;
    if (event.target.checked) {
      // Add the value to the selected values
      setSelectedValuesIso([...selectedValuesIso, values]);
    } else {
      // Remove the value from the selected values
      setSelectedValuesIso(selectedValuesIso.filter((item) => item !== values));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_FORM' });
    try {
      const bussinessArr = selectedValuesBussiness;
      const str = bussinessArr.join(',');
      // console.log(str)
      const IsoArr = selectedValuesIso;
      const str1 = IsoArr.join(',');
      // console.log(str1)
      setFormBussiness(str)
      setFormIsoCertified(str1)

      const formData = {
        nameOfSupplier: nameOfSupplier,
        formDate,
        formOfficeAddress: formOfficeAddress,
        formOfficeContactPerson: formOfficeContactPerson,
        formOfficeDesignation: formOfficeDesignation || 'Not Available',
        formOfficeTelephone: formOfficeTelephone,
        formOfficeEmail: formOfficeEmail || 'Not Available',
        formOfficeFax: formOfficeFax || 'Not Available',
        formWorkAddress: formWorkAddress || 'Not Available',
        formWorkContactPerson: formWorkContactPerson,
        formWorkDesignation: formWorkDesignation || 'Not Available',
        formWorkTelephone: formWorkTelephone,
        formWorkEmail: formWorkEmail || 'Not Available',
        formWorkFax: formWorkFax || 'Not Available',
        formBussiness: bussinessArr.join(','),
        formProduct: formProduct,
        formIsoCertified: IsoArr.join(',') || 'Not Available',
        formRelevantField: formRelevantField || 'Not Available',
        formMajorClient: formMajorClient || 'Not Available',
        formOrderDate: formOrderDate,
        formLeadTime: formLeadTime || 'Not Available',
      };
      setLoading(true)
      axios.post(`http://${ipAddress}/submitVendorForm`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          console.log(response); // Access response data
          setLoading(false)
          dispatch({ type: 'SUBMIT_SUCCESS' });

          // Navigate to '/vendor' after a delay
          setTimeout(() => {
            setVendorPage(0)
            window.location.reload();
          }, 1000);
        })
        .catch(error => {
          setLoading(false)
          dispatch({ type: 'SUBMIT_ERROR', payload: 'Submission failed.' });
          console.log('Error:', error);
          // Handle the error as needed
        });

      useEffect(() => {
        getVendorFormData();
      }, []);

      async function getVendorFormData() {
        try {
          const response = await axios.get(`http://${ipAddress}/api/vendorform`);
          // Assuming the server is running on the same host
          // setFormData(response.data.data)
          // console.log(response.data)
        } catch (error) {
          console.error('Error:', error);
        }
      }
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR', payload: 'An error occurred.' });
    }
  }

  return (
    <div className='vendor-form-container'>
      <div className="vendor-form-head">
        <h1>Vendor Form</h1>
        {btnBack.map((item) => {
          return <NavLink to='/vendor'><Button variant="contained" className='add-vendor' key={item.id}>{item.back}</Button></NavLink>
        })}
        {/* <Button variant="contained" onClick={() => { setVendorPage(0) }}>Back</Button> */}
      </div>
      <div className='form-division'>
        <form action="" className='vendor-form' onSubmit={handleSubmit}>
          <span className='supplier-span'>
            <TextField
              className='NameOfSupplier'
              required
              id="outlined-multiline-flexible"
              label="Name Of Supplier"
              multiline
              maxRows={3}
              sx={{
                '& > :not(style)': { m: 1, width: 650 },
              }}
              onChange={(e) => setNameOfSupplier(e.target.value)}
            />
            <LocalizationProvider required dateAdapter={AdapterDayjs}>
              <DemoContainer required components={['DatePicker']}>
                <DatePicker required label="Date" onChange={handelOnchangeDate}
                  format="DD-MM-YYYY" // Set the format here
                  sx={{
                    '& > :not(style)': { m: 1, width: 430 },
                  }} />
              </DemoContainer>
            </LocalizationProvider>
          </span>
          <span className='office'>
            <span>
              <TextField
                className="address"
                id="outlined-textarea"
                label="Address[Office]:"
                required
                placeholder="Full Address (Office)"
                rows={8}
                multiline
                onChange={(e) => setFormOfficeAddress(e.target.value)}

              />
            </span>
            <span className='contact-span'>
              <div>
                <TextField id="outlined-basic"
                  label="Contact Person"
                  variant="outlined"
                  className='contactPerson'
                  required
                  onChange={(e) => setFormOfficeContactPerson(e.target.value)}
                  sx={{
                    '& > :not(style)': { width: 290 },
                  }}
                />
                <TextField id="outlined-basic" label="Designation" variant="outlined" className='Designation'
                  onChange={(e) => setFormOfficeDesignation(e.target.value)}
                  sx={{
                    '& > :not(style)': { width: 290 },
                  }}
                />
              </div>
              <div>
                <TextField id="outlined-basic" label="Telephone *" variant="outlined"
                  type='number'
                  onChange={(e) => setFormOfficeTelephone(e.target.value)}
                  inputProps={{ maxLength: 15 }}
                  sx={{
                    '& > :not(style)': { width: 290 },
                  }}
                />
                <TextField id="outlined-basic" label="Fax" variant="outlined"
                  onChange={(e) => setFormOfficeFax(e.target.value)}
                  sx={{
                    '& > :not(style)': { width: 290 },
                  }}
                />
                <TextField fullWidth label="Email Address " id="fullWidth"
                  onChange={(e) => setFormOfficeEmail(e.target.value)}
                  sx={{
                    '& > :not(style)': { width: 590 },
                  }}
                />
              </div>

            </span>
          </span>
          <br />
          <hr />
          <span className='work'>
            <span>
              <TextField
                className="address"
                id="outlined-textarea"
                label="Address[Work]:"
                placeholder="Full Address (Work)"
                rows={8}
                multiline
                onChange={(e) => setFormWorkAddress(e.target.value)}
              />
            </span>
            <span className='contact-span'>
              <div>
                <TextField id="outlined-basic" label="Contact Person" variant="outlined"
                  onChange={(e) => setFormWorkContactPerson(e.target.value)}
                  sx={{
                    '& > :not(style)': { width: 290 },
                  }}
                />
                <TextField id="outlined-basic" label="Designation" variant="outlined"
                  onChange={(e) => setFormWorkDesignation(e.target.value)}
                  sx={{
                    '& > :not(style)': { width: 290 },
                  }}
                />
              </div>
              <div>
                <TextField id="outlined-basic" label="Telephone" variant="outlined"
                  type='number'
                  onChange={(e) => setFormWorkTelephone(e.target.value)}
                  inputProps={{ maxLength: 15 }}
                  sx={{
                    '& > :not(style)': { width: 290 },
                  }}
                />
                <TextField id="outlined-basic" label="Fax" variant="outlined"
                  onChange={(e) => setFormWorkFax(e.target.value)}
                  sx={{
                    '& > :not(style)': { width: 290 },
                  }}
                />
                <TextField fullWidth label="Email Address " id="fullWidth"
                  onChange={(e) => setFormWorkEmail(e.target.value)}
                  sx={{
                    '& > :not(style)': { width: 590 },
                  }}
                />
              </div>
            </span>
          </span>
          <br />
          <hr />
          <div className='other-details'>
            {/* <TextField fullWidth label="Nature Of Business " id="fullWidth" required
              onChange={(e) => setFormBussiness(e.target.value)}

            /> */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              color: 'rgb(113, 114, 114)',
              border: '0.5px solid rgb(157, 159, 159)',
              width: '100%',
              height: '60px',
              padding: '10px',
              borderRadius: '4px'

            }}>
              <p style={{
                fontSize: '20px'
              }}>Nature of bussiness:</p>
              <label>
                <input
                  type="checkbox"
                  name="businessType"
                  value="Manufacturing"
                  onChange={handleCheckboxChange}
                /> Manufacturing
              </label>
              <label>
                <input
                  type="checkbox"
                  name="businessType"
                  value="Trading"
                  onChange={handleCheckboxChange}
                /> Trading
              </label>
              <label>
                <input
                  type="checkbox"
                  name="businessType"
                  value="Designing"
                  onChange={handleCheckboxChange}
                /> Designing
              </label>
            </div>
            <TextField fullWidth label="Products/ Services" id="fullWidth" required
              onChange={(e) => setFormProduct(e.target.value)} />
            {/* <TextField fullWidth label="Whether ISO 9001 certified" id="fullWidth"
              onChange={(e) => setFormIsoCertified(e.target.value)} /> */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              color: 'rgb(113, 114, 114)',
              border: '0.5px solid rgb(157, 159, 159)',
              width: '100%',
              height: '60px',
              padding: '10px',
              borderRadius: '4px'

            }}>
              <p style={{
                fontSize: '20px'
              }}>Whether ISO 9001 certified:</p>
              <label>
                <input
                  type="checkbox"
                  name="certified"
                  value="Yes"
                  onChange={handleIsoCheckChange}
                /> Yes
              </label>
              <label>
                <input
                  type="checkbox"
                  name="certified"
                  value="No"
                  onChange={handleIsoCheckChange}
                /> No
              </label>
              <label>
                <input
                  type="checkbox"
                  name="certified"
                  value="Not Known"
                  onChange={handleIsoCheckChange}
                /> Not Known
              </label>
            </div>
            <TextField fullWidth label="Number of years of doing business in relevant field" id="fullWidth"
              onChange={(e) => setFormRelevantField(e.target.value)} />

            {/* <TextField type='date' fullWidth id="fullWidth" required
              onChange={(e) => setFormOrderDate(e.target.value)} /> */}
            <div className='span-lead'>
              <span>
                <TextField label="Major Clients" id="fullWidth"
                  onChange={(e) => setFormMajorClient(e.target.value)}
                  sx={{
                    '& > :not(style)': { m: 1, width: 350 },
                  }}
                />
              </span>
              <span >
                <LocalizationProvider required dateAdapter={AdapterDayjs}>
                  <DemoContainer required components={['DatePicker']}>
                    <DatePicker required label="Order trail Date" onChange={handelOnChangeTrail}
                      format="DD-MM-YYYY" // Set the format here
                      sx={{
                        '& > :not(style)': { width: 350 },
                      }} />
                  </DemoContainer>
                </LocalizationProvider>
              </span>
              <span style={{
                width: '620px'
              }}>
                <TextField label="Lead time for supply" placeholder='Ex:2-4 months' required id="fullWidth"
                  onChange={(e) => setFormLeadTime(e.target.value)}
                  sx={{
                    '& > :not(style)': { m: 1, width: 350 },
                  }} />
              </span>
            </div>
            {/* <input fullWidth  type="date" name="Date" id="date" className='formDate' onChange={(e) => setFormOrderDate(e.target.value)} /> */}
            <div className='error'>
              {state.isSubmitted ? (
                <div>Form submitted successfully!</div>
              ) : (
                <div>{state.error || ''}</div>
              )}
            </div>
          </div>
          <br />

          <div style={{
            width: '50%',
            display: 'flex',
            justifyContent: 'space-around'
          }}>
            <Button variant="contained" style={{
              width: '20%'
            }} onClick={() => setVendorPage(0)}>Cancel</Button>
            <Button variant="contained" type='submit' disabled={loading}>Submit</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VendorForm
