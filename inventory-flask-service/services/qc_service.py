def run_qc(data):
    serial_no = data.get("serial_no")

    # example logic (later replace with real one)
    if not serial_no:
        return {"success": False, "message": "Serial no missing"}

    return {
        "success": True,
        "serial_no": serial_no,
        "qc_status": "PASS"
    }
