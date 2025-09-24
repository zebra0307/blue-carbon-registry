const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwYmExNDYwYy1kZjM4LTQyZjEtYjBlZS0zMGVjMDVjOGQ1ZWQiLCJlbWFpbCI6InlzYXR5ZW5kcmEwMzA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0NDA1NjcwZTg5OTdmZjNhMDM2MyIsInNjb3BlZEtleVNlY3JldCI6ImYyMzBmMjFlMjI3YjE2NTEzYTg2ZmUzNWQxOTM0ZGE5ZjQ4MzJhOTEzMTY1YjMxMzNhNjkyMzRmNGE3NWM4ZjciLCJleHAiOjE3OTAxNTczODN9.DpDm6Q6Hf7DIxXqMp3gULJJ80yYEZZoWF0WBVDRqL7c';

async function createSampleFiles() {
  console.log('🚀 Creating sample files for IPFS upload...');

  const sampleFiles = [
    {
      name: 'project-verification.pdf',
      content: Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Project Verification Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000179 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
274
%%EOF`),
      projectId: 'subbu0111'
    },
    {
      name: 'environmental-impact-assessment.txt',
      content: Buffer.from(`Environmental Impact Assessment Report
======================================

Project: Blue Carbon Registry Project
Date: ${new Date().toISOString()}

1. Project Overview
This document outlines the environmental impact assessment for the blue carbon project.

2. Environmental Considerations
- Marine ecosystem protection
- Carbon sequestration benefits
- Biodiversity conservation
- Sustainable development practices

3. Conclusion
The project demonstrates positive environmental impact with significant carbon storage potential.

Document generated for Blue Carbon Registry demonstration purposes.`),
      projectId: 'subbu0111'
    },
    {
      name: 'site-photos-metadata.json',
      content: Buffer.from(JSON.stringify({
        projectId: 'BCP-0307',
        photoCount: 15,
        location: 'Coastal Area, Bangladesh',
        captureDate: '2024-09-24',
        description: 'Site documentation photos showing project area and restoration activities',
        metadata: {
          equipment: 'Digital Camera',
          resolution: '4K',
          gpsCoordinates: '23.8103°N, 90.4125°E'
        }
      }, null, 2)),
      projectId: 'BCP-0307'
    },
    {
      name: 'project-monitoring-report.txt',
      content: Buffer.from(`Project Monitoring Report
========================

Project ID: akshat_hr
Monitoring Period: Q3 2024

Carbon Sequestration Data:
- Baseline measurement: 0 tons CO2
- Current storage: 0 tons CO2 (project in initial phase)
- Projected annual storage: 50 tons CO2

Ecosystem Health Indicators:
- Wetland area coverage: 200 hectares
- Species diversity index: Baseline established
- Water quality parameters: Within acceptable limits

Next monitoring cycle: Q4 2024

Report compiled by Environmental Monitoring Team
Blue Carbon Registry Project Management`),
      projectId: 'akshat_hr'
    }
  ];

  const uploadedFiles = [];

  for (const file of sampleFiles) {
    try {
      console.log(`📤 Uploading ${file.name}...`);
      
      // Create temporary file
      const tempPath = `/tmp/${file.name}`;
      fs.writeFileSync(tempPath, file.content);

      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempPath));
      formData.append('pinataMetadata', JSON.stringify({
        name: `${file.projectId}-${file.name}`,
        keyvalues: {
          projectId: file.projectId,
          fileName: file.name,
          fileType: file.name.includes('.pdf') ? 'application/pdf' : file.name.includes('.json') ? 'application/json' : 'text/plain',
          uploadedBy: 'Blue Carbon Registry Demo',
          timestamp: new Date().toISOString()
        }
      }));
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1
      }));

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders()
        }
      });

      const result = {
        projectId: file.projectId,
        fileName: file.name,
        ipfsHash: response.data.IpfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        size: response.data.PinSize,
        uploadedAt: new Date().toISOString()
      };

      uploadedFiles.push(result);
      console.log(`✅ ${file.name} uploaded successfully!`);
      console.log(`   IPFS Hash: ${result.ipfsHash}`);
      console.log(`   URL: ${result.ipfsUrl}`);

      // Clean up temp file
      fs.unlinkSync(tempPath);

    } catch (error) {
      console.error(`❌ Error uploading ${file.name}:`, error.message);
    }
  }

  console.log('\n🎉 All sample files uploaded! Here are the real IPFS hashes to use:');
  console.log('=====================================\n');

  uploadedFiles.forEach(file => {
    console.log(`Project: ${file.projectId}`);
    console.log(`File: ${file.fileName}`);
    console.log(`Hash: ${file.ipfsHash}`);
    console.log(`URL: ${file.ipfsUrl}`);
    console.log(`Size: ${file.size} bytes`);
    console.log(`---`);
  });

  return uploadedFiles;
}

createSampleFiles().catch(console.error);