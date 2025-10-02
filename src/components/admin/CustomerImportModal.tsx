"use client"

import { useState, useRef } from "react"
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle, Download } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

interface CustomerImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

export default function CustomerImportModal({
  isOpen,
  onClose,
  onImportComplete
}: CustomerImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      if (extension === 'csv' || extension === 'xlsx' || extension === 'xls') {
        setFile(selectedFile)
        setResult(null)
      } else {
        alert('Sila pilih fail CSV atau Excel (.xlsx, .xls)')
      }
    }
  }

  const parseFile = async (file: File): Promise<any[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension === 'csv') {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        })
      })
    } else {
      // Excel file
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = e.target?.result
            const workbook = XLSX.read(data, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            resolve(jsonData)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
        reader.readAsBinaryString(file)
      })
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    try {
      // Parse the file
      const data = await parseFile(file)

      // Send to API
      const response = await fetch('/api/customers/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customers: data })
      })

      const result = await response.json()
      setResult(result)

      if (result.success > 0) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Import error:', error)
      setResult({
        success: 0,
        failed: 0,
        errors: ['Ralat semasa membaca fail. Sila pastikan format fail adalah betul.']
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    // Create sample CSV data
    const csvContent = `name,phone,email,isMember
Siti Aminah,0123456789,siti@example.com,true
Nur Aisyah,0198765432,nur@example.com,false
Fatimah Zahra,0167891234,fatimah@example.com,true`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_import_pelanggan.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetModal = () => {
    setFile(null)
    setResult(null)
    setImporting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Upload className="w-6 h-6 mr-2 text-rose-600" />
            Import Pelanggan (CSV/Excel)
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">
                  Template Import
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Muat turun template untuk memastikan format yang betul. Format yang diperlukan:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 mb-3 ml-4 list-disc">
                  <li><strong>name</strong> - Nama pelanggan (wajib)</li>
                  <li><strong>phone</strong> - Nombor telefon (wajib, tanpa -)</li>
                  <li><strong>email</strong> - Email (pilihan)</li>
                  <li><strong>isMember</strong> - Status ahli: true/false (pilihan, default: false)</li>
                </ul>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Muat Turun Template CSV
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Fail CSV atau Excel
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-rose-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-3" />
                <span className="text-sm font-medium text-gray-900 mb-1">
                  {file ? file.name : 'Klik untuk pilih fail'}
                </span>
                <span className="text-xs text-gray-500">
                  Format yang disokong: CSV, XLSX, XLS
                </span>
              </label>
            </div>
          </div>

          {/* Import Result */}
          {result && (
            <div className={`rounded-lg p-4 ${result.success > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start">
                {result.success > 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium mb-2 ${result.success > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    Keputusan Import
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-700">
                      ✓ Berjaya: {result.success} pelanggan
                    </p>
                    {result.failed > 0 && (
                      <p className="text-red-700">
                        ✗ Gagal: {result.failed} pelanggan
                      </p>
                    )}
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-900 mb-1">Ralat:</p>
                      <ul className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                        {result.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={importing}
          >
            Tutup
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengimport...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Pelanggan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
