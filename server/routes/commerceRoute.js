import express from "express";
import {
  getImportData,
  getExportData,
} from "../controllers/commerceController.js";

const router = express.Router();

// İthalat verileri (import)
router.get("/import", getImportData);

// İhracat verileri (export)
router.get("/export", getExportData);

export default router;
