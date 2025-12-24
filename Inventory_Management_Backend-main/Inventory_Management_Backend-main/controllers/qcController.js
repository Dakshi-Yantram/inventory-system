export const checkQC = async (req, res) => {
  try {
    const { serial_no } = req.body;

    const flaskRes = await fetch("http://localhost:5001/qc/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serial_no })
    });

    const flaskData = await flaskRes.json();

    return res.json({
      success: true,
      data: flaskData
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
