# inventory-system

# Inventory Management System

A full-stack **Inventory Management System** designed for managing materials, stock flow, and quality control using a **microservice architecture**.

This project is maintained under the **Dakshi-Yantram** organization and supports scalable inventory operations with traceability and QC validation.

---

## Features

- Inventory & Stock Management
- Vendor & Customer Tracking
- Work Order & BOM Integration
- Quality Control (QC) Microservice
- Frontend ↔ Backend ↔ Flask Microservice communication
- Structured database design for traceability

---

## Project Architecture

---

## Tech Stack

### Frontend
- React
- Material UI
- Axios

### Backend
- Node.js
- Express.js
- MySQL

### QC Microservice
- Python
- Flask
- REST APIs

---

## QC Microservice Role

The **Flask QC service** handles:
- Automated quality checks
- Validation rules
- Independent QC logic
- Secure API communication with backend

This keeps QC logic **decoupled** from the main backend.

---

## Setup Instructions

### 1️Clone the repository
```bash
git clone https://github.com/Dakshi-Yantram/inventory-system.git
cd inventory-system

