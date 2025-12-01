import React, { useState, useEffect } from 'react';
import './Procurement.css';
import Button from '@mui/material/Button';
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from 'axios';
import ProcurementDataTable from './ProcurementDataTable';
import ProcurementSummary from './ProcurementSummary'



let summary = [{
    id: 1,
    title: 'Procurement Summary'
}]

function ProcurementNew(props) {
    const { procurementPage, setProcurementPage, ipAddress } = props
    const [projectTemplateData, setProjectTemplateData] = useState([]);
    const [dataNotFound, setDataNotFound] = useState(false);
    const [procurementDropdown, setprocurementDropdown] = useState([]);
    const [detailsOfProject, setProjectOfDeatils] = useState([])

    const [projectInputs, setProjectInputs] = useState([{ projectName: "", qty: "" }]);
    const [fetchedData, setFetchedData] = useState([]);

    const handleProjectInputChange = (index, key, value) => {
        const updatedProjectInputs = [...projectInputs];
        updatedProjectInputs[index][key] = value;
        setProjectInputs(updatedProjectInputs);
    };

    const addProjectField = () => {
        setProjectInputs([...projectInputs, { projectName: "", qty: "" }]);
    };

    useEffect(() => {
        getprocurementDropdown();
    }, []);

    async function getprocurementDropdown() {
        try {
            const response = await axios.get(`http://${ipAddress}/projectDetails`);
            console.log("PROJECT API RESPONSE:", response.data.data);

            const projectDataWithSerial = response.data.data.map((item, index) => ({
                ...item,
                sr_no: index + 1,
            }));
            setprocurementDropdown(projectDataWithSerial);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleFetchData = async () => {
        try {
            const fetchedDataArray = [];

            for (let i = 0; i < projectInputs.length; i++) {
                const currentInput = projectInputs[i];

                const response = await axios.post(`http://${ipAddress}/api/getProjectTemplateData`, {
                    projectInputs: [currentInput],
                });

                if (response.status === 200) {
                    const qty = parseInt(currentInput.qty) || 0;

                    const projectDataWithSerial = response.data.data.map((item, index) => ({
                        ...item,
                        sr_no: index + 1,

                        totalQty: Math.round(qty * (parseInt(item.qty_pcb) || 0)),

                        finalQty: Math.round(
                            qty *
                            (parseInt(item.qty_pcb) || 0) *
                            (1 + (parseInt(item.ExtraPercentage) || 0) / 100)
                        ),
                    }));

                    fetchedDataArray.push(projectDataWithSerial);
                } else {
                    console.error(`Failed to fetch project template data for input ${i}:`, response.data.error);
                    fetchedDataArray.push([]);
                }
            }

            setFetchedData(fetchedDataArray);

            // Check if at least one set of data was fetched successfully
            const hasData = fetchedDataArray.some(data => data.length > 0);
            setDataNotFound(!hasData);
        } catch (error) {
            console.error('An error occurred while fetching data:', error);
        }
    };


    // console.log(`projectInputs : ${JSON.stringify(projectInputs)}`)
    // console.log(`fetchedData :${JSON.stringify(fetchedData)}`)
    // console.log(fetchedData)

    function sumFinalQtyForCommonMaterialNames(data) {
        var resultMap = new Map();

        // Iterate through each array in the data
        data.forEach(array => {
            // Iterate through each item in the array
            array.forEach(item => {
                // Check if material_name is already in the resultMap
                if (resultMap.has(item.material_name)) {
                    // If yes, add finalQty to the existing value
                    resultMap.set(item.material_name, resultMap.get(item.material_name) + item.finalQty);
                } else {
                    // If no, add material_name to the resultMap with finalQty as the initial value
                    resultMap.set(item.material_name, item.finalQty);
                }
            });
        });

        // Convert Map to array of objects
        var resultArray = Array.from(resultMap, ([materialName, finalQty]) => ({ materialName, finalQty }));
        return resultArray;
    }

    // Example: Sum the finalQty for common material_names
    var result = sumFinalQtyForCommonMaterialNames(fetchedData);
    // console.log(result)

    // Output the result
    // console.log(fetchedData)

    return (

        <div>
            {procurementPage === 1 ? <ProcurementSummary setProcurementPage={setProcurementPage} result={result} ipAddress={ipAddress} /> :
                <div className='main-procurement-container'>
                    <div className="procurement-container">
                        <div className='procurement-btns'>
                            <h1>Procurement Page</h1>
                        </div>
                        <div className='project-input-container'>
                            {projectInputs.map((project, index) => (
                                <div key={index} className='project-input-container-main-div'>
                                    <div className='pro-div'>
                                        <div className="project-inputs">
                                            <h2><label>Project Name:</label></h2>
                                            <Autocomplete
                                                disablePortal
                                                value={project.projectName || null}
                                                // Change this to `value={project.projectName || ''}`
                                                id="combo-box-demo"
                                                options={procurementDropdown.map((item) => item.ProjectName)}
                                                renderInput={(params) => <TextField {...params} />}
                                                onChange={(e, newValue) =>
                                                    handleProjectInputChange(index, "projectName", newValue)
                                                }

                                                sx={{
                                                    '& > :not(style)': { m: 1, width: 350 },
                                                }}
                                            />

                                            <TextField
                                                id="outlined-basic"
                                                type='number'
                                                label="monthly qty"
                                                variant="outlined"
                                                value={project.qty}
                                                onChange={(e) =>
                                                    handleProjectInputChange(index, "qty", e.target.value)
                                                }
                                            />
                                            <Button variant="contained" onClick={() => handleFetchData(index)}>
                                                Submit
                                            </Button>
                                        </div>
                                        <div className="project-data-grid">
                                            {fetchedData[index] && fetchedData[index].length > 0 && (
                                                <ProcurementDataTable projectTemplateData={fetchedData[index]} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="procurement-repeat">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    margin: '30px 5px'
                                }} className='procurement-add-summary-btns'>
                                    <Button variant="contained" onClick={addProjectField}>
                                        Add More
                                    </Button>

                                    {summary.map((item) => {
                                        return <Button variant="contained" key={item.id} onClick={() => setProcurementPage(item.id)} >
                                            procurement summary
                                        </Button>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
        </div>
    );
}

export default ProcurementNew;
