export const handleMappingChange = (excelHeader, dbField, setMapping) => {
  setMapping((prevMapping) => ({
    ...prevMapping,
    [dbField]: excelHeader
  }))
}
