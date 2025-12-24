import { useState } from "react";
import axios from "axios";

function OrderRegister() {

  const [form, setForm] = useState({
    verbal_PNo: "",                 // ✅ changed
    order_date: "",
    customer_details: "",           // ✅ changed
    item_details: "",               // ✅ changed
    reviewed_by: "",
    qty_ordered: "",
    schedule_delivery: "",          // ✅ changed
    actual_delivery_date: "",
    qty_delivered: "",
    invoice_no: "",
    remarks: ""
  });

  // ✅ Balance auto calculate
  const balance =
    Number(form.qty_ordered || 0) - Number(form.qty_delivered || 0);

  // ✅ Input handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit
  const handleSubmit = async () => {
    try {
      if (!form.verbal_PNo || !form.customer_details || !form.item_details || !form.qty_ordered) {
        alert("Please fill required fields (Order No, Customer, Item, Quantity)");
        return;
      }

      await axios.post("http://localhost:3000/add-order", {
        ...form,
        balance_qty: balance   // ✅ DB name
      });

      alert("Order Saved Successfully");

      // ✅ Reset form
      setForm({
        verbal_PNo: "",
        order_date: "",
        customer_details: "",
        item_details: "",
        reviewed_by: "",
        qty_ordered: "",
        schedule_delivery: "",
        actual_delivery_date: "",
        qty_delivered: "",
        invoice_no: "",
        remarks: ""
      });

    } catch (err) {
      alert("Error saving order");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px", width: "450px" }}>

      <h2>Order Register (As per Manual Register)</h2>

      <input
        name="verbal_PNo"
        placeholder="Verbal / PO No"
        value={form.verbal_PNo}
        onChange={handleChange}
      /><br/><br/>

      <input
        type="date"
        name="order_date"
        value={form.order_date}
        onChange={handleChange}
      /><br/><br/>

      <input
        name="customer_details"
        placeholder="Customer / Supplier"
        value={form.customer_details}
        onChange={handleChange}
      /><br/><br/>

      <input
        name="item_details"
        placeholder="Item Details / Specifications"
        value={form.item_details}
        onChange={handleChange}
      /><br/><br/>

      <input
        name="reviewed_by"
        placeholder="Reviewed By"
        value={form.reviewed_by}
        onChange={handleChange}
      /><br/><br/>

      <input
        type="number"
        name="qty_ordered"
        placeholder="Quantity Ordered"
        value={form.qty_ordered}
        onChange={handleChange}
      /><br/><br/>

      <input
        type="date"
        name="schedule_delivery"
        value={form.schedule_delivery}
        onChange={handleChange}
      /><br/><br/>

      <input
        type="date"
        name="actual_delivery_date"
        value={form.actual_delivery_date}
        onChange={handleChange}
      /><br/><br/>

      <input
        type="number"
        name="qty_delivered"
        placeholder="Quantity Delivered"
        value={form.qty_delivered}
        onChange={handleChange}
      /><br/><br/>

      <input
        name="invoice_no"
        placeholder="Invoice No"
        value={form.invoice_no}
        onChange={handleChange}
      /><br/><br/>

      <textarea
        name="remarks"
        placeholder="Remarks"
        value={form.remarks}
        onChange={handleChange}
        rows="3"
      ></textarea><br/><br/>

      <p><strong>Balance Quantity:</strong> {balance}</p>

      <button onClick={handleSubmit}>Save Order</button>
    </div>
  );
}

export default OrderRegister;
